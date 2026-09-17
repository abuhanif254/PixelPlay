import { createClient } from '@/lib/supabase/server';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'c64b58e7a6374f1797c271e89cf29bb8';
export const INDEXNOW_HOST = (process.env.NEXT_PUBLIC_SITE_DOMAIN || 'spielcade.com').toLowerCase();
export const KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
export const MAX_URLS_PER_BATCH = 100;

/**
 * Constant-time string equality check to prevent timing attacks.
 * Pure Web Standards implementation compatible with Edge Runtime and Node.js.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates and filters URLs to ensure they strictly belong to the platform domain.
 * Discards any external links, phishing URLs, invalid schemes, and credentials.
 */
export function sanitizeAndFilterIndexNowUrls(rawUrls: unknown[]): string[] {
  if (!Array.isArray(rawUrls)) return [];

  const validUrls: string[] = [];
  const allowedHost = INDEXNOW_HOST.toLowerCase();

  for (const raw of rawUrls) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    try {
      const parsed = new URL(trimmed);

      // Must be https scheme
      if (parsed.protocol !== 'https:') continue;

      // Must strictly match canonical host (e.g. spielcade.com)
      if (parsed.hostname.toLowerCase() !== allowedHost) continue;

      // Disallow credentials in URLs
      if (parsed.username || parsed.password) continue;

      // Clean URL: strip hash fragments
      parsed.hash = '';

      validUrls.push(parsed.toString());
    } catch {
      // Invalid URL format - ignore
    }
  }

  // Deduplicate and cap batch size
  return Array.from(new Set(validUrls)).slice(0, MAX_URLS_PER_BATCH);
}

/**
 * Authorizes IndexNow requests via either:
 * 1. Pre-shared secret header (`Authorization: Bearer <token>` or `x-indexnow-secret: <token>`)
 * 2. Active authenticated Supabase session with `role === 'admin'`
 */
export async function verifyIndexNowAuth(request: Request): Promise<{
  authorized: boolean;
  method?: 'secret' | 'admin_session';
  reason?: string;
}> {
  const configuredSecret = process.env.INDEXNOW_SECRET || process.env.CRON_SECRET;

  // 1. Check Bearer Token or Custom Header Secret
  const authHeader = request.headers.get('authorization');
  const customSecret = request.headers.get('x-indexnow-secret');

  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : null;
  const providedSecret = bearerToken || customSecret;

  if (configuredSecret && providedSecret) {
    if (constantTimeEqual(providedSecret, configuredSecret)) {
      return { authorized: true, method: 'secret' };
    }
  }

  // 2. Check Admin Session via Supabase auth cookies
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        return { authorized: true, method: 'admin_session' };
      }
    }
  } catch {
    // Session retrieval error (e.g. unauthenticated)
  }

  return {
    authorized: false,
    reason: 'Unauthorized: Admin session or valid bearer token required',
  };
}

/**
 * Submits validated URL list directly to Microsoft Bing / IndexNow API.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<{
  ok: boolean;
  status: number;
  submitted: number;
  error?: string;
}> {
  const sanitized = sanitizeAndFilterIndexNowUrls(urls);

  if (sanitized.length === 0) {
    return {
      ok: false,
      status: 400,
      submitted: 0,
      error: `No valid https://${INDEXNOW_HOST} URLs provided`,
    };
  }

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: sanitized,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const ok = res.ok || res.status === 200 || res.status === 202;

    return {
      ok,
      status: res.status,
      submitted: sanitized.length,
      error: ok ? undefined : `IndexNow responded with status ${res.status}`,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: err.name === 'AbortError' ? 504 : 500,
      submitted: sanitized.length,
      error: err.message || 'Submission to IndexNow failed',
    };
  }
}
