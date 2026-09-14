export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';
const CHUNK_SIZE = 1000;
const FALLBACK_TOTAL_GAMES = 20000;

export async function GET() {
  let gamesCount = FALLBACK_TOTAL_GAMES;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    // Timeout after 2500ms to guarantee Googlebot never encounters an edge timeout
    const fetchPromise = supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const timeoutPromise = new Promise<{ count: number | null; error: any }>((resolve) =>
      setTimeout(() => resolve({ count: FALLBACK_TOTAL_GAMES, error: null }), 2500)
    );

    const { count: totalGames, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (!error && typeof totalGames === 'number' && totalGames > 0) {
      gamesCount = totalGames;
    }
  } catch (err) {
    console.warn('Sitemap index fallback to default chunk count:', err);
  }

  const numChunks = Math.max(1, Math.ceil(gamesCount / CHUNK_SIZE));

  const sitemaps = [
    `${baseUrl}/sitemap/static.xml`,
    `${baseUrl}/sitemap/categories.xml`,
    `${baseUrl}/sitemap/tags.xml`,
    `${baseUrl}/sitemap/blog.xml`,
  ];

  for (let i = 1; i <= numChunks; i++) {
    sitemaps.push(`${baseUrl}/sitemap/games/${i}.xml`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (url) => `  <sitemap>
    <loc>${url}</loc>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'Cloudflare-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
