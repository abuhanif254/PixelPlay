// apps/web/lib/analytics/beacon-client.ts
// RFC-BEACON-001: Client-Side Beacon Dispatcher with keepalive fallback

export interface AdBeaconPayload {
  token: string;
  viewabilityMs: number;
  gameId?: string | null;
  slotId: string;
  clientTimestamp?: number;
}

/**
 * Requests an ephemeral signed token for an ad slot from the Edge API.
 */
export async function fetchAdImpressionToken(params: {
  slotId: string;
  gameId?: string | null;
  sessionId?: string | null;
}): Promise<string | null> {
  try {
    const res = await fetch('/api/analytics/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slot_id: params.slotId,
        game_id: params.gameId || null,
        session_id: params.sessionId || null,
      }),
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.token || null;
  } catch (err) {
    console.warn('[AdBeacon] Failed to fetch impression token:', err);
    return null;
  }
}

/**
 * Dispatches an anti-cheat verified ad impression beacon via navigator.sendBeacon
 * with graceful fallback to fetch keepalive.
 */
export function sendAdImpressionBeacon(payload: AdBeaconPayload): boolean {
  if (typeof window === 'undefined') return false;

  const data = {
    token: payload.token,
    viewability_ms: Math.max(1000, Math.floor(payload.viewabilityMs)),
    game_id: payload.gameId || null,
    slot_id: payload.slotId,
    client_timestamp: payload.clientTimestamp || Date.now(),
  };

  const jsonStr = JSON.stringify(data);

  // 1. Primary: navigator.sendBeacon (asynchronous background queue, survives tab close)
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const success = navigator.sendBeacon('/api/analytics/beacon', blob);
      if (success) return true;
    } catch (err) {
      console.warn('[AdBeacon] sendBeacon exception, falling back to fetch keepalive:', err);
    }
  }

  // 2. Fallback: fetch with keepalive: true
  try {
    fetch('/api/analytics/beacon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonStr,
      keepalive: true,
    }).catch(() => {
      // Background catch to silence unhandled rejections during unload
    });
    return true;
  } catch (err) {
    console.warn('[AdBeacon] All beacon transports failed:', err);
    return false;
  }
}
