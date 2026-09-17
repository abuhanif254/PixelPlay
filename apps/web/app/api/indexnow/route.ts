export const runtime = 'edge';

import { createClient } from '@/lib/supabase/server';
import { 
  verifyIndexNowAuth, 
  sanitizeAndFilterIndexNowUrls, 
  submitUrlsToIndexNow, 
  INDEXNOW_HOST 
} from '@/lib/indexnow';

export async function POST(request: Request) {
  try {
    // 1. Authorization check (Secret token or Admin session required)
    const auth = await verifyIndexNowAuth(request);
    if (!auth.authorized) {
      return Response.json(
        { error: auth.reason || 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 2. Parse & sanitize payload
    const body = await request.json().catch(() => ({}));
    const rawUrls = Array.isArray(body.urls) ? body.urls : [];

    if (rawUrls.length === 0) {
      return Response.json(
        { error: 'No URLs provided in payload' }, 
        { status: 400 }
      );
    }

    const validUrls = sanitizeAndFilterIndexNowUrls(rawUrls);
    if (validUrls.length === 0) {
      return Response.json(
        { error: `No valid https://${INDEXNOW_HOST} URLs provided in payload` }, 
        { status: 400 }
      );
    }

    // 3. Dispatch to IndexNow
    const result = await submitUrlsToIndexNow(validUrls);
    return Response.json({
      success: result.ok,
      submitted: result.submitted,
      indexnowStatus: result.status,
      urls: validUrls,
      error: result.error,
    }, { status: result.ok ? 200 : (result.status >= 400 && result.status < 600 ? result.status : 500) });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Submission failed' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 1. Authorization check (Secret token or Admin session required)
    const auth = await verifyIndexNowAuth(request);
    if (!auth.authorized) {
      return Response.json(
        { error: auth.reason || 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const supabase = createClient();

    const { data: latestGames } = await supabase
      .from('games')
      .select('slug')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(25);

    const rawUrls = (latestGames || []).map((g: any) => `https://${INDEXNOW_HOST}/games/${g.slug}`);

    // Add root hubs
    rawUrls.unshift(`https://${INDEXNOW_HOST}/`);
    rawUrls.push(`https://${INDEXNOW_HOST}/categories/car-games`);
    rawUrls.push(`https://${INDEXNOW_HOST}/categories/zombie-games`);
    rawUrls.push(`https://${INDEXNOW_HOST}/categories/stickman-games`);
    rawUrls.push(`https://${INDEXNOW_HOST}/categories/2-player-games`);
    rawUrls.push(`https://${INDEXNOW_HOST}/categories/unblocked-games`);

    const validUrls = sanitizeAndFilterIndexNowUrls(rawUrls);
    const result = await submitUrlsToIndexNow(validUrls);

    return Response.json({
      success: result.ok,
      submitted: result.submitted,
      indexnowStatus: result.status,
      urls: validUrls,
      error: result.error,
    }, { status: result.ok ? 200 : (result.status >= 400 && result.status < 600 ? result.status : 500) });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Auto-submit failed' }, 
      { status: 500 }
    );
  }
}