export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';
const CHUNK_SIZE = 1000;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const gamesCount = totalGames || 0;
  const numChunks = Math.max(1, Math.ceil(gamesCount / CHUNK_SIZE));

  const sitemaps = [
    `${baseUrl}/sitemap/static.xml`,
    `${baseUrl}/sitemap/categories.xml`,
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
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
