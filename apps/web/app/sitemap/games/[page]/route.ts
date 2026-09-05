export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';
const CHUNK_SIZE = 1000;

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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
    .select('slug, title, image_url, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Sitemap games query error:', error);
  }

  const gameList = games || [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${gameList
  .map((game: any) => {
    const loc = `${baseUrl}/games/${game.slug}`;
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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
