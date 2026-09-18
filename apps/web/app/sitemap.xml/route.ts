export const runtime = 'edge';
export const revalidate = 3600;

import { getCachedCatalogData } from '@/lib/catalog-cache';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';
const CHUNK_SIZE = 1000;
const FALLBACK_TOTAL_GAMES = 20000;

function buildSitemapXml(gamesCount: number): string {
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (url) => `  <sitemap>
    <loc>${url}</loc>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;
}

const SITEMAP_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  'Cloudflare-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  'X-Robots-Tag': 'noindex',
};

export async function GET() {
  let gamesCount = FALLBACK_TOTAL_GAMES;

  try {
    const catalog = await getCachedCatalogData();
    if (catalog?.totalActiveGames && catalog.totalActiveGames > 0) {
      gamesCount = catalog.totalActiveGames;
    }
  } catch (err) {
    console.warn('[Sitemap] Failed to get cached catalog count, using fallback:', err);
  }

  const xml = buildSitemapXml(gamesCount);

  return new Response(xml, {
    status: 200,
    headers: SITEMAP_HEADERS,
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: SITEMAP_HEADERS,
  });
}
