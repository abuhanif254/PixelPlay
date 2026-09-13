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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || searchParams.get('genre')?.trim() || '';
    const limitParam = parseInt(searchParams.get('limit') || '12', 10);
    const limit = Math.min(Math.max(limitParam, 4), 24);

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
      return (
        g.title.toLowerCase().includes(normQ) ||
        g.slug.toLowerCase().includes(normQ) ||
        g.category.toLowerCase().includes(normQ)
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

    // 2. Query Supabase
    let dbGames: any[] = [];
    try {
      const supabase = createClient();
      let dbQuery = supabase
        .from('games')
        .select('id, title, slug, image_url, category, rating, total_plays')
        .eq('status', 'active');

      if (category && category !== 'All' && !isOriginalCategory) {
        dbQuery = dbQuery.ilike('category', `%${category}%`);
      }

      if (normQ && normQ !== 'original' && normQ !== 'originals') {
        dbQuery = dbQuery.or(
          `title.ilike.%${q}%,slug.ilike.%${q}%,category.ilike.%${q}%`
        );
      }

      dbQuery = dbQuery.order('total_plays', { ascending: false }).limit(limit);

      const { data, error } = await dbQuery;
      if (!error && data) {
        dbGames = data;
      } else if (error) {
        console.error('Search DB error:', error);
      }
    } catch (err) {
      console.error('Search DB connection exception:', err);
    }

    // 3. Merge & Deduplicate results, prioritizing matching original games
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

      // Fix any original games that exist in DB with empty image_url
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
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('Search API exception:', err);
    return NextResponse.json({ games: ORIGINAL_FLAGSHIP_GAMES }, { status: 200 });
  }
}

