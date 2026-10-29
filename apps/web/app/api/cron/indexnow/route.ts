export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitUrlsToIndexNow, INDEXNOW_HOST, sanitizeAndFilterIndexNowUrls } from '@/lib/indexnow';
import { categoriesData } from '@/lib/mockCategories';

/**
 * Scheduled Automated IndexNow Ping Endpoint
 * Periodically called (e.g. daily/weekly via Vercel Cron, Cloudflare Worker, or GitHub Actions)
 * to refresh search engine crawl queues for trending and active games.
 */
export async function GET(request: NextRequest) {
  return handleIndexNowCron(request);
}

export async function POST(request: NextRequest) {
  return handleIndexNowCron(request);
}

async function handleIndexNowCron(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecretHeader = request.headers.get('x-cron-secret');
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');

  const configuredSecret = process.env.CRON_SECRET || process.env.INDEXNOW_SECRET;
  const isDev = process.env.NODE_ENV === 'development';

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
    console.warn('[IndexNowCron] No CRON_SECRET configured.');
  }

  try {
    const supabase = createClient();

    // 1. Fetch 150 most active/recently updated games
    const { data: games, error } = await supabase
      .from('games')
      .select('slug')
      .eq('status', 'active')
      .order('total_plays', { ascending: false })
      .limit(150);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const host = INDEXNOW_HOST || 'spielcade.com';
    const urls: string[] = [
      `https://${host}/`,
      `https://${host}/games`,
      `https://${host}/popular`,
      `https://${host}/categories`,
      `https://${host}/leaderboard`,
      `https://${host}/blog`,
    ];

    // 2. Add high-traffic category hubs
    const categorySlugs = Object.keys(categoriesData);
    for (const catSlug of categorySlugs) {
      urls.push(`https://${host}/categories/${catSlug}`);
    }

    // 3. Add game URLs
    for (const g of (games || [])) {
      if (g.slug) {
        urls.push(`https://${host}/games/${g.slug}`);
      }
    }

    const validUrls = sanitizeAndFilterIndexNowUrls(urls);
    const result = await submitUrlsToIndexNow(validUrls);

    return NextResponse.json({
      success: result.ok,
      submitted: result.submitted,
      indexnowStatus: result.status,
      count: validUrls.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[IndexNowCron] Error during scheduled ping:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
