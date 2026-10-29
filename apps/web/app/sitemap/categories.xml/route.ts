export const runtime = 'edge';
export const revalidate = 3600;

import { categoriesData } from '@/lib/mockCategories';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

export async function GET() {
  const categoryEntries = Object.entries(categoriesData);
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${categoryEntries
  .map(([slug, cat]) => {
    const bannerUrl = `${baseUrl}/images/categories/${escapeXml(slug)}.jpg`;
    return `  <url>
    <loc>${baseUrl}/categories/${escapeXml(slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${baseUrl}/og-default.jpg</image:loc>
      <image:title>${escapeXml(cat.title)} Games on Spielcade</image:title>
    </image:image>
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
