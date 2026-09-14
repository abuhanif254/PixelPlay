export const runtime = 'edge';
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

export async function GET() {
  const staticRoutes = [
    { url: `${baseUrl}`, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/games`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/games/new`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/categories`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/popular`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/leaderboard`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/blog`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/offline`, priority: '0.7', changefreq: 'monthly' },
    { url: `${baseUrl}/help`, priority: '0.5', changefreq: 'monthly' },
    { url: `${baseUrl}/developers`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
    ...['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0-9'].map(l => ({
      url: `${baseUrl}/games/alphabetical/${l}`,
      priority: '0.8',
      changefreq: 'weekly'
    })),
  ];

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
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
