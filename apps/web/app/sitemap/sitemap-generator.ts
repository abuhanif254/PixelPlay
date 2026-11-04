import { isPolicyCompliantGame } from '@/lib/policy-compliance';
import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';
const CHUNK_SIZE = 1000;

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/**
 * Generates direct 200 OK XML response for a specific 1000-game chunk.
 * Zero redirects, 100% GSC compliant.
 */
export async function generateGameChunkXml(pageNum: number): Promise<Response> {
  const safePageNum = Math.max(1, pageNum);
  const start = (safePageNum - 1) * CHUNK_SIZE;
  const end = start + CHUNK_SIZE - 1;

  let gameList: any[] = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    const { data: games, error } = await supabase
      .from('games')
      .select('slug, title, image_url, created_at, source_url')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) {
      console.error('[Sitemap] games query error for page ' + safePageNum + ':', error);
    } else if (games) {
      gameList = (games || []).filter(isPolicyCompliantGame);
    }
  } catch (err) {
    console.error('[Sitemap] unexpected error for page ' + safePageNum + ':', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${gameList
  .map((game: any) => {
    const loc = `${baseUrl}/games/${escapeXml(game.slug)}`;
    const lastmod = new Date(game.created_at || Date.now()).toISOString();
    const imageTag = game.image_url
      ? `\n    <image:image>
      <image:loc>${escapeXml(game.image_url)}</image:loc>
      <image:title>${escapeXml(game.title || game.slug)}</image:title>
    </image:image>`
      : '';

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'Cloudflare-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}

/**
 * Generates consolidated 200 OK XML response for ALL active games (up to 50,000 URLs).
 * Queries Supabase in parallel chunks and caches on Edge CDN.
 */
export async function generateAllGamesXml(): Promise<Response> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  let allGames: any[] = [];
  try {
    const { count } = await supabase
      .from('games')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    const totalGames = count || 18546;
    const numBatches = Math.max(1, Math.ceil(totalGames / CHUNK_SIZE));
    const batchPromises = [];

    for (let i = 0; i < numBatches; i++) {
      const start = i * CHUNK_SIZE;
      const end = start + CHUNK_SIZE - 1;
      batchPromises.push(
        supabase
          .from('games')
          .select('slug, title, image_url, created_at, source_url')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(start, end)
      );
    }

    const batchResults = await Promise.all(batchPromises);
    for (const res of batchResults) {
      if (res.data) {
        allGames.push(...res.data.filter(isPolicyCompliantGame));
      }
    }
  } catch (err) {
    console.error('[Sitemap] generateAllGamesXml unexpected error:', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allGames
  .map((game: any) => {
    const loc = `${baseUrl}/games/${escapeXml(game.slug)}`;
    const lastmod = new Date(game.created_at || Date.now()).toISOString();
    const imageTag = game.image_url
      ? `\n    <image:image>
      <image:loc>${escapeXml(game.image_url)}</image:loc>
      <image:title>${escapeXml(game.title || game.slug)}</image:title>
    </image:image>`
      : '';

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'Cloudflare-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
