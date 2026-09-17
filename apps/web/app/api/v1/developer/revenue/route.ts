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
  const daysParam = parseInt(searchParams.get('days') || '30', 10);
  const limitDays = Math.min(Math.max(daysParam || 30, 1), 365);
  const gameIdFilter = searchParams.get('game_id');

  // 1. Fetch settled ledger from developer_revenue
  let revenueQuery = supabase
    .from('developer_revenue')
    .select('id, game_id, date, impressions, gross_revenue, developer_share, platform_share, created_at')
    .eq('developer_id', developer.developerId)
    .order('date', { ascending: false })
    .limit(limitDays);

  if (gameIdFilter) {
    revenueQuery = revenueQuery.eq('game_id', gameIdFilter);
  }

  const { data: records, error: revenueError } = await revenueQuery;

  if (revenueError) {
    return NextResponse.json(
      { error: 'Failed to retrieve revenue ledger.', details: revenueError.message },
      { status: 500 }
    );
  }

  const settledRecords = records || [];

  // 2. Fetch active games for title mapping & live accrual calculation
  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, total_plays')
    .eq('developer_id', developer.developerId)
    .eq('status', 'active');

  const gameMap = new Map<string, { title: string; slug: string }>();
  let totalActivePlays = 0;

  (games || []).forEach((g) => {
    gameMap.set(g.id, { title: g.title, slug: g.slug });
    totalActivePlays += Number(g.total_plays) || 0;
  });

  // Calculate settled totals
  const totalSettledEarnings = settledRecords.reduce(
    (sum, r) => sum + (Number(r.developer_share) || 0),
    0
  );
  const totalGrossRevenue = settledRecords.reduce(
    (sum, r) => sum + (Number(r.gross_revenue) || 0),
    0
  );
  const totalSettledImpressions = settledRecords.reduce(
    (sum, r) => sum + (Number(r.impressions) || 0),
    0
  );

  // Real-time accrual projection
  const estimatedTotalImpressions = Math.floor(totalActivePlays * 2.4);
  const estimatedTotalEarnings = Number(
    ((estimatedTotalImpressions / 1000) * 1.20 * 0.70).toFixed(4)
  );
  const pendingAccrual = Math.max(0, Number((estimatedTotalEarnings - totalSettledEarnings).toFixed(4)));

  // Formatted records with game metadata
  const formattedRecords = settledRecords.map((r) => {
    const gameInfo = r.game_id ? gameMap.get(r.game_id) : null;
    return {
      id: r.id,
      date: r.date,
      game_id: r.game_id,
      game_title: gameInfo?.title || 'Platform Game',
      game_slug: gameInfo?.slug || null,
      impressions: Number(r.impressions) || 0,
      gross_revenue_usd: Number(r.gross_revenue) || 0,
      developer_share_usd: Number(r.developer_share) || 0,
      platform_share_usd: Number(r.platform_share) || 0,
      settled_at: r.created_at,
    };
  });

  return NextResponse.json({
    success: true,
    developer_id: developer.developerId,
    currency: 'USD',
    pricing_model: {
      publisher_net_rev_share: '70%',
      platform_margin: '30%',
      platform_base_ecpm_usd: 1.20,
      ad_impressions_per_play: 2.4,
      minimum_payout_threshold_usd: 50.0,
    },
    summary: {
      settled_earnings_usd: Number(totalSettledEarnings.toFixed(2)),
      pending_accrual_usd: Number(pendingAccrual.toFixed(2)),
      total_projected_earnings_usd: Number(
        Math.max(totalSettledEarnings, estimatedTotalEarnings).toFixed(2)
      ),
      gross_platform_revenue_usd: Number(totalGrossRevenue.toFixed(2)),
      total_ad_impressions: totalSettledImpressions > 0 ? totalSettledImpressions : estimatedTotalImpressions,
      days_queried: limitDays,
      records_count: formattedRecords.length,
    },
    ledger: formattedRecords,
  });
}
