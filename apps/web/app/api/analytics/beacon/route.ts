export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyImpressionToken } from '@/lib/security/ad-token';
import { createClient } from '@/lib/supabase/server';

// Hash IP address with SHA-256 for GDPR/COPPA compliance (no raw IP storage)
async function hashIpAddress(ip: string): Promise<string> {
  if (!ip) return 'unknown';
  const encoder = new TextEncoder();
  const data = encoder.encode(ip.trim());
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Lightweight bot detection
function isKnownBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes('headlesschrome') ||
    ua.includes('phantomjs') ||
    ua.includes('selenium') ||
    ua.includes('puppeteer') ||
    ua.includes('python-requests') ||
    ua.includes('curl/') ||
    ua.includes('wget/') ||
    ua.includes('go-http-client')
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody || rawBody.trim().length === 0) {
      return NextResponse.json({ error: 'Empty beacon payload.' }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed beacon JSON payload.' }, { status: 400 });
    }

    const { token, viewability_ms, game_id, slot_id } = payload;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Impression token is required.' }, { status: 400 });
    }

    const viewMs = Number(viewability_ms);
    if (!Number.isFinite(viewMs) || viewMs < 1000) {
      return NextResponse.json(
        { error: 'Viewability duration too short. Minimum 1000ms required by IAB standards.' },
        { status: 400 }
      );
    }

    // 1. Client header inspection & bot rejection
    const userAgent = request.headers.get('user-agent');
    if (isKnownBotUserAgent(userAgent)) {
      return NextResponse.json(
        { error: 'Automated agent / bot traffic rejected.' },
        { status: 403 }
      );
    }

    // 2. Cryptographic Token Verification (HMAC-SHA256 & 120s TTL)
    const verification = await verifyImpressionToken(token);
    if (!verification.valid) {
      return NextResponse.json(
        { error: `Token verification failed: ${verification.error}`, code: verification.reason },
        { status: 400 }
      );
    }

    const { payload: tokenData } = verification;

    // Slot validation: verify payload slotId matches token
    if (slot_id && tokenData.slotId !== slot_id.trim()) {
      return NextResponse.json(
        { error: 'Token slotId mismatch with beacon payload.' },
        { status: 400 }
      );
    }

    // 3. Extract client context
    const rawIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      'unknown';
    const ipHash = await hashIpAddress(rawIp);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Atomic Record Insertion & Anti-Replay Nonce Check
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('record_verified_ad_impression', {
        p_game_id: game_id || tokenData.gameId || null,
        p_slot_id: tokenData.slotId,
        p_session_id: tokenData.sessionId || null,
        p_user_id: user?.id || null,
        p_nonce: tokenData.nonce,
        p_viewability_ms: Math.floor(viewMs),
        p_ip_hash: ipHash,
        p_user_agent: (userAgent || 'unknown').slice(0, 255),
      });

      if (!rpcError && rpcResult) {
        if (rpcResult.replay_detected) {
          return NextResponse.json(
            { error: 'Replay detected: this impression token has already been claimed.', code: 'REPLAY_DETECTED' },
            { status: 409 }
          );
        }

        if (!rpcResult.success) {
          return NextResponse.json(
            { error: rpcResult.error || 'Failed to record impression.' },
            { status: 400 }
          );
        }

        return new NextResponse(null, { status: 204 });
      }

      // Graceful fallback if stored procedure not yet executed on remote Supabase
      if (rpcError) {
        console.warn('record_verified_ad_impression RPC fallback engaged:', rpcError.message);
      }

      // Check if nonce already exists
      const { data: existing } = await supabase
        .from('ad_impressions')
        .select('id')
        .eq('nonce', tokenData.nonce)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'Replay detected: this impression token has already been claimed.', code: 'REPLAY_DETECTED' },
          { status: 409 }
        );
      }

      const { error: insertErr } = await supabase.from('ad_impressions').insert([
        {
          game_id: game_id || tokenData.gameId || null,
          slot_id: tokenData.slotId,
          session_id: tokenData.sessionId || null,
          user_id: user?.id || null,
          nonce: tokenData.nonce,
          viewability_ms: Math.floor(viewMs),
          verified: true,
          ip_hash: ipHash,
          user_agent: (userAgent || 'unknown').slice(0, 255),
        },
      ]);

      if (insertErr) {
        if (insertErr.code === '23505') {
          // Unique constraint violation (replay)
          return NextResponse.json(
            { error: 'Replay detected: duplicate nonce.', code: 'REPLAY_DETECTED' },
            { status: 409 }
          );
        }
        console.error('ad_impressions fallback insert error:', insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return new NextResponse(null, { status: 204 });
    } catch (dbErr: any) {
      console.error('Database connection exception in beacon route:', dbErr);
      return NextResponse.json({ error: 'Database unavailable.' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Unexpected error in beacon route:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
