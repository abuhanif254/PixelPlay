export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateDeveloperRequest, apiAuthErrorResponse } from '@/lib/auth/api-key';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await authenticateDeveloperRequest(request);
  if (!auth.success) {
    return apiAuthErrorResponse(auth);
  }

  const { developer } = auth;
  const supabase = createClient();

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  let query = supabase
    .from('games')
    .select('id, title, slug, description, category, tags, status, total_plays, rating, image_url, source_url, created_at, updated_at')
    .eq('developer_id', developer.developerId)
    .order('created_at', { ascending: false });

  if (statusFilter && ['active', 'pending', 'draft', 'rejected'].includes(statusFilter)) {
    query = query.eq('status', statusFilter);
  }

  const { data: games, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve games catalog.', details: error.message },
      { status: 500 }
    );
  }

  const gamesList = games || [];

  // Transform with revenue metrics and play telemetry
  const formattedGames = gamesList.map((g) => {
    const plays = Number(g.total_plays) || 0;
    const estImpressions = Math.floor(plays * 2.4);
    const estRevenueUsd = Number(((estImpressions / 1000) * 1.20 * 0.70).toFixed(4));

    return {
      id: g.id,
      title: g.title,
      slug: g.slug,
      description: g.description,
      category: g.category,
      tags: g.tags || [],
      status: g.status,
      metrics: {
        total_plays: plays,
        rating: Number(g.rating) || 0,
        estimated_ad_impressions: estImpressions,
        estimated_developer_earnings_usd: estRevenueUsd,
      },
      urls: {
        public_page: `https://spielcade.com/games/${g.slug}`,
        embed_endpoint: g.source_url,
        score_submission: `https://spielcade.com/api/v1/developer/games/${g.slug}/scores`,
      },
      created_at: g.created_at,
      updated_at: g.updated_at,
    };
  });

  return NextResponse.json({
    success: true,
    developer_id: developer.developerId,
    total: formattedGames.length,
    games: formattedGames,
  });
}
