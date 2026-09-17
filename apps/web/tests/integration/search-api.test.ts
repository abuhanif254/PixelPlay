import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as searchGET } from '@/app/api/search/route';
import * as supabaseServer from '@/lib/supabase/server';

describe('Edge Search API Route Integration (RFC-TEST-001)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 200 with cache-control headers on query', async () => {
    const mockSupabase: any = {
      rpc: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

    const req = new NextRequest('http://localhost:3000/api/search?q=snake');
    const res = await searchGET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('public, s-maxage=180, stale-while-revalidate=600');
    expect(Array.isArray(data.games)).toBe(true);
    // Flagship Snake should be included
    expect(data.games.some((g: any) => g.slug === 'snake')).toBe(true);
  });

  it('should return instant originals when filtering category=originals without DB call', async () => {
    const mockSupabase: any = {
      rpc: vi.fn(),
    };
    vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

    const req = new NextRequest('http://localhost:3000/api/search?category=originals');
    const res = await searchGET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.games).toHaveLength(3);
    const slugs = data.games.map((g: any) => g.slug);
    expect(slugs).toContain('snake');
    expect(slugs).toContain('flappy-bird');
    expect(slugs).toContain('2048');
    // DB RPC should NOT have been called
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  it('should gracefully fall back to indexed column queries if RPC fails', async () => {
    const mockFallbackGames = [
      {
        id: 'db-game-1',
        title: 'Retro Racer',
        slug: 'retro-racer',
        category: 'Racing',
        rating: 4.8,
        image_url: '/racer.png',
        total_plays: 12000,
      },
    ];

    const mockSupabase: any = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'function search_games does not exist' },
      }),
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({
            ilike: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: mockFallbackGames, error: null }),
              }),
            }),
          }),
        }),
      }),
    };
    vi.spyOn(supabaseServer, 'createClient').mockReturnValue(mockSupabase);

    const req = new NextRequest('http://localhost:3000/api/search?q=racer');
    const res = await searchGET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.games).toHaveLength(1);
    expect(data.games[0].slug).toBe('retro-racer');
  });
});
