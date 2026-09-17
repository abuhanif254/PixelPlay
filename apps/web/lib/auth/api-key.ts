import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AuthenticatedDeveloper {
  developerId: string;
  keyId: string;
  keyName: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  lastUsedAt?: string | null;
}

export type ApiKeyAuthResult =
  | { success: true; developer: AuthenticatedDeveloper }
  | { success: false; error: string; status: number; code: string };

/**
 * Validates the raw format of a Spielcade Master API key.
 * Format standard: 'sp_live_' prefix followed by 64 hexadecimal characters.
 */
export function validateApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return /^sp_live_[a-f0-9]{64}$/.test(key.trim());
}

/**
 * Computes SHA-256 hex digest using Web Crypto API.
 * 100% compatible with Next.js Edge Runtime, Cloudflare Pages, and Node.js.
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key.trim());
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extracts the API key from request headers.
 * Accepts:
 *   1. 'Authorization: Bearer sp_live_...'
 *   2. 'x-api-key: sp_live_...'
 */
export function extractApiKeyFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const candidate = authHeader.substring(7).trim();
    if (candidate) return candidate;
  }

  const customHeader = headers.get('x-api-key');
  if (customHeader && customHeader.trim()) {
    return customHeader.trim();
  }

  return null;
}

/**
 * Server-authoritative Master API Key authenticator.
 * Authenticates the developer, checks account standing, and updates last_used_at.
 */
export async function authenticateDeveloperRequest(
  request: Request | NextRequest
): Promise<ApiKeyAuthResult> {
  const rawKey = extractApiKeyFromHeaders(request.headers);

  if (!rawKey) {
    return {
      success: false,
      error: 'Missing API key. Provide Authorization: Bearer sp_live_... or x-api-key header.',
      status: 401,
      code: 'API_KEY_REQUIRED',
    };
  }

  if (!validateApiKeyFormat(rawKey)) {
    return {
      success: false,
      error: 'Invalid API key format. Expected sp_live_<64-character-hex-string>.',
      status: 401,
      code: 'INVALID_API_KEY_FORMAT',
    };
  }

  const keyHash = await hashApiKey(rawKey);
  const supabase = createClient();

  try {
    // 1. Primary: Try high-performance SECURITY DEFINER RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('authenticate_api_key', {
      p_key_hash: keyHash,
    });

    if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      const row = rpcData[0];
      if (row.is_banned) {
        return {
          success: false,
          error: 'Developer account has been suspended. Please contact platform support.',
          status: 403,
          code: 'ACCOUNT_SUSPENDED',
        };
      }

      return {
        success: true,
        developer: {
          developerId: row.developer_id,
          keyId: row.key_id,
          keyName: row.key_name || 'Master API Key',
          username: row.username || 'developer',
          fullName: row.full_name,
          avatarUrl: row.avatar_url,
          email: row.email,
          role: row.role || 'user',
          isBanned: false,
          createdAt: row.created_at,
          lastUsedAt: row.last_used_at,
        },
      };
    }

    // 2. Fallback: Direct table query if RPC is not yet propagated
    const { data: keyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('id, developer_id, name, created_at, last_used_at')
      .eq('key_hash', keyHash)
      .maybeSingle();

    if (keyError || !keyRecord) {
      return {
        success: false,
        error: 'Invalid or revoked API key.',
        status: 401,
        code: 'INVALID_API_KEY',
      };
    }

    // Fetch developer profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, role, is_banned')
      .eq('id', keyRecord.developer_id)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        success: false,
        error: 'Developer profile associated with this API key not found.',
        status: 404,
        code: 'DEVELOPER_NOT_FOUND',
      };
    }

    if (profile.is_banned) {
      return {
        success: false,
        error: 'Developer account has been suspended.',
        status: 403,
        code: 'ACCOUNT_SUSPENDED',
      };
    }

    // Asynchronously update last_used_at timestamp
    (async () => {
      try {
        await supabase
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', keyRecord.id);
      } catch (err) {
        console.warn('Failed to update last_used_at:', err);
      }
    })();

    return {
      success: true,
      developer: {
        developerId: profile.id,
        keyId: keyRecord.id,
        keyName: keyRecord.name || 'Master API Key',
        username: profile.username || 'developer',
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        email: null,
        role: profile.role || 'user',
        isBanned: false,
        createdAt: keyRecord.created_at,
        lastUsedAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    console.error('API key authentication exception:', err);
    return {
      success: false,
      error: 'Authentication subsystem error.',
      status: 500,
      code: 'AUTH_INTERNAL_ERROR',
    };
  }
}

/**
 * Standard JSON response envelope for API authentication rejections.
 */
export function apiAuthErrorResponse(authResult: { error: string; status?: number; code?: string }) {
  return NextResponse.json(
    {
      error: authResult.error,
      code: authResult.code || 'UNAUTHORIZED',
      documentation: 'https://spielcade.com/studio/docs',
    },
    { status: authResult.status || 401 }
  );
}
