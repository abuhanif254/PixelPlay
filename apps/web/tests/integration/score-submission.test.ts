import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitScore } from '@/app/games/actions';
import * as supabaseServer from '@/lib/supabase/server';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Score Submission & Anti-Cheat Integration (RFC-TEST-001)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should reject unauthenticated users', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

    const result = await submitScore('snake', 1500);
    expect(result.success).toBe(false);
    expect(result.error).toContain('User not logged in');
  });

  it('should reject out-of-bounds or non-finite scores', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
    };
    vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

    const resNegative = await submitScore('snake', -50);
    expect(resNegative.success).toBe(false);
    expect(resNegative.error).toContain('between 0 and 10,000,000');

    const resTooLarge = await submitScore('snake', 20_000_000);
    expect(resTooLarge.success).toBe(false);
    expect(resTooLarge.error).toContain('between 0 and 10,000,000');

    const resNaN = await submitScore('snake', NaN);
    expect(resNaN.success).toBe(false);
    expect(resNaN.error).toContain('must be a valid number');
  });

  it('should enforce anti-cheat cooldown debounce (3 seconds between scores)', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
      from: (table: string) => {
        if (table === 'games') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'game-snake', total_plays: 100, status: 'active' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'scores') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: () => ({
                      // Score submitted 1 second ago (within 3s debounce window)
                      maybeSingle: vi.fn().mockResolvedValue({
                        data: { created_at: new Date(Date.now() - 1000).toISOString() },
                      }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      },
    };
    vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

    const result = await submitScore('snake', 1500);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Rate limit');
  });

  it('should successfully record valid score and compute progression', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const updateProfileMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const mockSupabase: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
      from: (table: string) => {
        if (table === 'games') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'game-snake', total_plays: 100, status: 'active' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'scores') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: () => ({
                      // Score submitted 10 seconds ago (outside debounce window)
                      maybeSingle: vi.fn().mockResolvedValue({
                        data: { created_at: new Date(Date.now() - 10000).toISOString() },
                      }),
                    }),
                  }),
                }),
              }),
            }),
            insert: insertMock,
          };
        }
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { xp: 450, level: 1, streak: 3 },
                }),
              }),
            }),
            update: updateProfileMock,
          };
        }
        if (table === 'user_achievements') {
          return {
            select: () => ({
              eq: vi.fn().mockResolvedValue({ data: [] }),
            }),
          };
        }
        if (table === 'achievements') {
          return {
            select: vi.fn().mockResolvedValue({ data: [] }),
          };
        }
        return {};
      },
    };
    vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

    const result = await submitScore('snake', 1500);
    expect(result.success).toBe(true);
    expect(insertMock).toHaveBeenCalledWith([
      { user_id: 'user-123', game_id: 'game-snake', score: 1500 },
    ]);
  });
});
