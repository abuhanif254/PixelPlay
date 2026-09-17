export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface SearchGameItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  rating: number;
  image_url: string;
  total_plays?: number;
  isOriginal?: boolean;
}

const ORIGINAL_FLAGSHIP_GAMES: SearchGameItem[] = [
  {
    id: 'original-snake',
    slug: 'snake',
    title: 'Neon Snake',
    category: 'Arcade',
    rating: 4.9,
    image_url: '/images/games/snake.svg',
    total_plays: 55000,
    isOriginal: true,
  },
  {
    id: 'original-flappy-bird',
    slug: 'flappy-bird',
    title: 'Neon Flyer',
    category: 'Arcade',
    rating: 4.9,
    image_url: '/images/games/flappy-bird.svg',
    total_plays: 52000,
    isOriginal: true,
  },
  {
    id: 'original-2048',
    slug: '2048',
    title: '2048 Classic',
    category: 'Puzzle',
    rating: 4.9,
    image_url: '/images/games/2048.svg',
    total_plays: 48000,
    isOriginal: true,
  },
];

/**
 * Sanitizes and normalizes user search queries.
 * Strips control characters, null bytes, and trims excess whitespace.
 */
function sanitizeSearchQuery(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control characters
    .replace(/[%_\\]/g, ' ') // replace SQL wildcard characters
    .trim()
    .slice(0, 80); // clamp query length
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQ = searchParams.get('q') || '';
    const q = sanitizeSearchQuery(rawQ);
    const category = searchParams.get('category')?.trim() || searchParams.get('genre')?.trim() || '';
    const limitParam = parseInt(searchParams.get('limit') || '12', 10);
    const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 12, 4), 24);

    const normQ = q.toLowerCase();
    const isOriginalCategory = category.toLowerCase() === 'originals' || category.toLowerCase() === 'original';

    // 1. Filter local flagship original games
    const matchedOriginals = ORIGINAL_FLAGSHIP_GAMES.filter((g) => {
      // Category check
      if (category && category !== 'All' && !isOriginalCategory) {
        if (g.category.toLowerCase() !== category.toLowerCase()) return false;
      }
      // Query check
      if (!normQ) return true;
      if (normQ === 'original' || normQ === 'originals' || normQ === 'flagship') return true;

      const titleLower = g.title.toLowerCase();
      const slugLower = g.slug.toLowerCase();
      const categoryLower = g.category.toLowerCase();

      return (
        titleLower.includes(normQ) ||
        slugLower.includes(normQ) ||
        categoryLower.includes(normQ) ||
        (normQ === 'flapy' && slugLower.includes('flappy')) ||
        (normQ === 'snke' && slugLower.includes('snake'))
      );
    });

    // If searching strictly for Originals with no other query, return them immediately
    if (isOriginalCategory && !normQ) {
      return NextResponse.json(
        { games: matchedOriginals },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // 2. Query Database via High-Performance Hybrid Search RPC (pg_trgm + tsvector)
    let dbGames: any[] = [];
    try {
      const supabase = createClient();

      // Attempt primary high-speed hybrid RPC search
      const { data: rpcData, error: rpcError } = await supabase.rpc('search_games', {
        search_query: q,
        category_filter: category && category !== 'All' && !isOriginalCategory ? category : null,
        limit_val: limit,
        similarity_threshold: 0.2,
      });

      if (!rpcError && Array.isArray(rpcData)) {
        dbGames = rpcData;
      } else {
        if (rpcError) {
          console.warn('search_games RPC fallback engaged:', rpcError.message);
        }

        // Graceful Fallback: Execute standard query if stored procedure is not yet applied
        let fallbackQuery = supabase
          .from('games')
          .select('id, title, slug, image_url, category, rating, total_plays')
          .eq('status', 'active');

        if (category && category !== 'All' && !isOriginalCategory) {
          fallbackQuery = fallbackQuery.ilike('category', `%${category}%`);
        }

        if (normQ && normQ !== 'original' && normQ !== 'originals') {
          fallbackQuery = fallbackQuery.ilike('title', `%${q}%`);
        }

        fallbackQuery = fallbackQuery.order('total_plays', { ascending: false }).limit(limit);
        const { data: fallbackData } = await fallbackQuery;
        if (fallbackData) {
          dbGames = fallbackData;
        }
      }
    } catch (err) {
      console.error('Search DB connection exception:', err);
    }

    // 3. Merge & Deduplicate results, prioritizing matching flagship originals
    const seen = new Set<string>();
    const merged: SearchGameItem[] = [];

    // Push matched original games first
    for (const og of matchedOriginals) {
      seen.add(og.slug);
      merged.push(og);
    }

    // Push database games
    for (const g of dbGames) {
      if (seen.has(g.slug)) continue;
      seen.add(g.slug);

      let finalImage = g.image_url;
      let isOriginal = false;

      // Ensure flagship game assets are rendered correctly
      if (g.slug === 'snake') {
        finalImage = '/images/games/snake.svg';
        isOriginal = true;
      } else if (g.slug === 'flappy-bird') {
        finalImage = '/images/games/flappy-bird.svg';
        isOriginal = true;
      } else if (g.slug === '2048') {
        finalImage = '/images/games/2048.svg';
        isOriginal = true;
      } else if (!finalImage || finalImage.includes('og-default.jpg')) {
        finalImage = '/images/category-3d-objects.jpg';
      }

      merged.push({
        id: g.id || g.slug,
        slug: g.slug,
        title: g.title,
        category: g.category || 'Arcade',
        rating: g.rating || 4.8,
        image_url: finalImage,
        total_plays: g.total_plays || 0,
        isOriginal,
      });
    }

    return NextResponse.json(
      { games: merged.slice(0, limit) },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('Search API exception:', err);
    return NextResponse.json({ games: ORIGINAL_FLAGSHIP_GAMES }, { status: 200 });
  }
}
