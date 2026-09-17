export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Daily Automated Developer Revenue Settlement Engine
 * Invoked nightly (e.g. at 00:05 UTC) via Vercel Cron, GitHub Actions, or platform scheduler.
 */
export async function GET(request: NextRequest) {
  return handleSettlement(request);
}

export async function POST(request: NextRequest) {
  return handleSettlement(request);
}

async function handleSettlement(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecretHeader = request.headers.get('x-cron-secret');
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');

  const configuredSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV === 'development';

  // Validate cron secret if configured
  if (configuredSecret) {
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const provided = bearer || cronSecretHeader || querySecret;

    if (provided !== configuredSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid cron authorization secret.' },
        { status: 401 }
      );
    }
  } else if (!isDev) {
    // In production, ensure protection is enabled
    console.warn('CRON_SECRET is not configured in environment.');
  }

  const supabase = createClient();
  const results: any[] = [];

  // 1. Target yesterday (standard UTC settlement)
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // 2. Target today (real-time catch-up)
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    // Settle yesterday
    const { data: yesterdayData, error: yesterdayError } = await supabase.rpc(
      'settle_daily_developer_revenue',
      { target_date: yesterdayStr }
    );

    results.push({
      target_date: yesterdayStr,
      success: !yesterdayError,
      data: yesterdayData || null,
      error: yesterdayError?.message || null,
    });

    // Settle today
    const { data: todayData, error: todayError } = await supabase.rpc(
      'settle_daily_developer_revenue',
      { target_date: todayStr }
    );

    results.push({
      target_date: todayStr,
      success: !todayError,
      data: todayData || null,
      error: todayError?.message || null,
    });

    // Optional: initial baseline sync for unseeded games
    if (searchParams.get('sync') === 'true') {
      const { data: syncData, error: syncError } = await supabase.rpc(
        'sync_developer_accrued_revenue'
      );
      results.push({
        action: 'baseline_sync',
        success: !syncError,
        data: syncData || null,
        error: syncError?.message || null,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      settlement_results: results,
      formula: {
        eCPM_usd: 1.20,
        impressions_per_play: 2.4,
        developer_share_percentage: '70%',
      },
    });
  } catch (err: any) {
    console.error('Unhandled revenue settlement failure:', err);
    return NextResponse.json(
      { error: 'Revenue settlement failed.', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
