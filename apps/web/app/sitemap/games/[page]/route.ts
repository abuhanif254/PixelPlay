export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';
const CHUNK_SIZE = 5000;

export async function GET(
  request: Request,
  { params }: { params: { page: string } }
) {
  const pageParam = params.page.replace(/\.xml$/, '');
  const pageNum = parseInt(pageParam, 10) || 1;
  const start = (pageNum - 1) * CHUNK_SIZE;
  const end = start + CHUNK_SIZE - 1;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  const { data: games, error } = await supabase
    .from('games')
    .select('slug, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Sitemap games query error:', error);
  }

  const gameList = games || [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${gameList
  .map(
    (game: any) => `  <url>
    <loc>${baseUrl}/games/${game.slug}</loc>
    <lastmod>${new Date(game.created_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
