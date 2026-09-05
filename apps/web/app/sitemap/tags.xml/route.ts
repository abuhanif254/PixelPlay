export const runtime = 'edge';
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

const HIGH_INTENT_TAGS = [
  'unblocked',
  'multiplayer',
  'car',
  'racing',
  'zombie',
  'stickman',
  '2-player',
  'shooting',
  'action',
  'puzzle',
  'arcade',
  'strategy',
  'adventure',
  'sports',
  'board',
  'escape',
  'runner',
  'clicker',
  'moto',
  'drift',
  '3d',
  'chromebook',
  'retro',
  'physics',
  'battle-royale'
];

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${HIGH_INTENT_TAGS
  .map(
    (tag) => `  <url>
    <loc>${baseUrl}/games/tags/${tag}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
