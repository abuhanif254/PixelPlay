export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

const INDEXNOW_KEY = 'c64b58e7a6374f1797c271e89cf29bb8';
const HOST = 'spielcade.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

async function submitToIndexNow(urlList: string[]) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList.slice(0, 10000),
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  return {
    status: res.status,
    ok: res.ok || res.status === 200 || res.status === 202,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body.urls) ? body.urls : [];

    if (urls.length === 0) {
      return Response.json({ error: 'No URLs provided in payload' }, { status: 400 });
    }

    const result = await submitToIndexNow(urls);
    return Response.json({
      success: result.ok,
      submitted: urls.length,
      indexnowStatus: result.status,
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    const { data: latestGames } = await supabase
      .from('games')
      .select('slug')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(25);

    const urls = (latestGames || []).map((g: any) => `https://${HOST}/games/${g.slug}`);

    // Add root hubs
    urls.unshift(`https://${HOST}/`);
    urls.push(`https://${HOST}/categories/car-games`);
    urls.push(`https://${HOST}/categories/zombie-games`);
    urls.push(`https://${HOST}/categories/stickman-games`);
    urls.push(`https://${HOST}/categories/2-player-games`);
    urls.push(`https://${HOST}/categories/unblocked-games`);

    const result = await submitToIndexNow(urls);

    return Response.json({
      success: result.ok,
      submitted: urls.length,
      indexnowStatus: result.status,
      urls,
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Auto-submit failed' }, { status: 500 });
  }
}