export const runtime = 'edge';
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

const HIGH_INTENT_TAGS = [
  '2048',
  'checkers',
  'ludo',
  'dominoes',
  'monster-truck',
  'parking',
  'archery',
  'aircraft',
  'pixel',
  'merge',
  'obby',
  'skibidi',
  'brawl-stars',
  'fnf',
  'squid-game',
  'minecraft',
  'stickman-archery',
  'penalty',
  'pinball',
  'water-slide',
];

export async function GET() {
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${HIGH_INTENT_TAGS
  .map(
    (tag) => `  <url>
    <loc>${baseUrl}/games/tags/${tag}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`
  )
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
