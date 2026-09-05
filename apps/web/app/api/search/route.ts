export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ games: [] });
    }

    const supabase = createClient();
    const { data: games, error } = await supabase
      .from('games')
      .select('id, title, slug, image_url, category, rating, total_plays')
      .ilike('title', `%${q}%`)
      .eq('status', 'active')
      .order('total_plays', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ games: [] });
    }

    return NextResponse.json(
      { games: games || [] },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('Search API exception:', err);
    return NextResponse.json({ games: [] }, { status: 200 });
  }
}
