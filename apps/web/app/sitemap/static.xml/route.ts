export const runtime = 'edge';
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

export async function GET() {
  const staticRoutes = [
    { url: `${baseUrl}`, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/games`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/categories`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/popular`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/leaderboard`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/blog`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/help`, priority: '0.5', changefreq: 'monthly' },
    { url: `${baseUrl}/developers`, priority: '0.5', changefreq: 'monthly' },
    { url: `${baseUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
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
