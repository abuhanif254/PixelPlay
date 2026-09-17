import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as tokenPOST } from '@/app/api/analytics/token/route';
import { POST as beaconPOST } from '@/app/api/analytics/beacon/route';
import { createImpressionToken } from '@/lib/security/ad-token';
import * as supabaseServer from '@/lib/supabase/server';

describe('Beacon API & Ad Impression Verification Integration (RFC-BEACON-001)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Ephemeral Token Generation Endpoint (/api/analytics/token)', () => {
    it('should generate a signed token for a valid slot request', async () => {
      const req = new NextRequest('http://localhost:3000/api/analytics/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: 'slot-banner-1', game_id: 'game-snake' }),
      });

      const res = await tokenPOST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(typeof data.token).toBe('string');
      expect(data.slot_id).toBe('slot-banner-1');
      expect(data.expires_in_sec).toBe(120);
    });

    it('should reject requests missing slot_id with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/analytics/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: 'game-snake' }),
      });

      const res = await tokenPOST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('2. Beacon Impression Verification Endpoint (/api/analytics/beacon)', () => {
    it('should reject viewability duration under 1,000ms (IAB standard)', async () => {
      const token = await createImpressionToken({ slotId: 'slot-1' });

      const req = new NextRequest('http://localhost:3000/api/analytics/beacon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: JSON.stringify({
          token,
          viewability_ms: 450, // Sub-second dwell
          slot_id: 'slot-1',
        }),
      });

      const res = await beaconPOST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Minimum 1000ms required');
    });

    it('should reject automated scraper bots with 403 Forbidden', async () => {
      const token = await createImpressionToken({ slotId: 'slot-1' });

      const req = new NextRequest('http://localhost:3000/api/analytics/beacon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HeadlessChrome/118.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          token,
          viewability_ms: 1500,
          slot_id: 'slot-1',
        }),
      });

      const res = await beaconPOST(req);
      expect(res.status).toBe(403);
    });

    it('should verify genuine human impression and return 204 No Content', async () => {
      const token = await createImpressionToken({ slotId: 'slot-728x90', gameId: 'game-2048' });

      const mockSupabase: any = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        rpc: vi.fn().mockResolvedValue({
          data: {
            success: true,
            impression_id: 'imp-uuid-1',
            replay_detected: false,
          },
          error: null,
        }),
      };
      vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

      const req = new NextRequest('http://localhost:3000/api/analytics/beacon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        body: JSON.stringify({
          token,
          viewability_ms: 1250,
          slot_id: 'slot-728x90',
          game_id: 'game-2048',
        }),
      });

      const res = await beaconPOST(req);
      expect(res.status).toBe(204);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'record_verified_ad_impression',
        expect.objectContaining({
          p_slot_id: 'slot-728x90',
          p_viewability_ms: 1250,
        })
      );
    });

    it('should detect and reject replay attacks with 409 Conflict', async () => {
      const token = await createImpressionToken({ slotId: 'slot-replay-test' });

      const mockSupabase: any = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        rpc: vi.fn().mockResolvedValue({
          data: {
            success: false,
            replay_detected: true,
            error: 'Replay detected: this impression nonce has already been claimed.',
          },
          error: null,
        }),
      };
      vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

      const req = new NextRequest('http://localhost:3000/api/analytics/beacon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: JSON.stringify({
          token,
          viewability_ms: 1500,
          slot_id: 'slot-replay-test',
        }),
      });

      const res = await beaconPOST(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.code).toBe('REPLAY_DETECTED');
    });
  });
});
