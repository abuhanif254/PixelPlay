import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as developerRevenueGET } from '@/app/api/v1/developer/revenue/route';
import * as apiKeyAuth from '@/lib/auth/api-key';
import * as supabaseServer from '@/lib/supabase/server';

describe('Developer API Route Integration (RFC-TEST-001)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Authentication Gatekeeping', () => {
    it('should reject requests without authorization header with 401 API_KEY_REQUIRED', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/developer/revenue');
      const res = await developerRevenueGET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.code).toBe('API_KEY_REQUIRED');
      expect(data.error).toContain('Missing API key');
    });

    it('should reject requests with malformed API keys with 401 INVALID_API_KEY_FORMAT', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/developer/revenue', {
        headers: {
          authorization: 'Bearer sp_live_invalid_short',
        },
      });
      const res = await developerRevenueGET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.code).toBe('INVALID_API_KEY_FORMAT');
    });
  });

  describe('2. Authenticated Revenue Ledger Retrieval', () => {
    it('should return settled ledger and real-time accruals for authenticated developer', async () => {
      const mockDeveloperId = 'dev-uuid-1234-5678';

      // Mock successful authentication
      vi.spyOn(apiKeyAuth, 'authenticateDeveloperRequest').mockResolvedValue({
        success: true,
        developer: {
          developerId: mockDeveloperId,
          keyId: 'key-123',
          keyName: 'Production Key',
          username: 'retro_dev',
          fullName: 'Retro Studios',
          avatarUrl: null,
          email: 'retro@example.com',
          role: 'developer',
          isBanned: false,
          createdAt: new Date().toISOString(),
        },
      });

      // Mock Supabase Client and responses
      const mockSettledRecords = [
        {
          id: 'rev-1',
          game_id: 'game-snake',
          date: '2026-09-15',
          impressions: 24000,
          gross_revenue: 28.8,
          developer_share: 20.16,
          platform_share: 8.64,
          created_at: '2026-09-15T00:00:00Z',
        },
      ];

      const mockGames = [
        {
          id: 'game-snake',
          title: 'Neon Snake',
          slug: 'snake',
          total_plays: 15000,
        },
      ];

      const mockSupabase: any = {
        from: (table: string) => {
          if (table === 'developer_revenue') {
            return {
              select: () => ({
                eq: () => ({
                  order: () => ({
                    limit: () => Promise.resolve({ data: mockSettledRecords, error: null }),
                  }),
                }),
              }),
            };
          }
          if (table === 'games') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => Promise.resolve({ data: mockGames, error: null }),
                }),
              }),
            };
          }
          return {};
        },
      };

      vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

      const req = new NextRequest('http://localhost:3000/api/v1/developer/revenue?days=30', {
        headers: {
          authorization: 'Bearer sp_live_a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
        },
      });

      const res = await developerRevenueGET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.developer_id).toBe(mockDeveloperId);
      expect(data.currency).toBe('USD');
      expect(data.ledger).toHaveLength(1);
      expect(data.ledger[0].game_title).toBe('Neon Snake');
      expect(data.ledger[0].developer_share_usd).toBe(20.16);
      expect(data.summary.settled_earnings_usd).toBe(20.16);
      expect(data.summary.total_ad_impressions).toBe(24000);
    });
  });
});
