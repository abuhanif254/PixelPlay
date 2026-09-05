export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';
import { categoriesData } from '@/lib/mockCategories';

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
  { params }: { params: { id: string } }
) {
  const cleanId = (params.id || '').replace(/\.xml$/, '');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  // If id is "static"
  if (cleanId === 'static') {
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

  // If id is "categories" or "0"
  if (cleanId === 'categories' || cleanId === '0') {
    const categorySlugs = Object.keys(categoriesData);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categorySlugs
  .map((slug) => {
    return `  <url>
    <loc>${baseUrl}/categories/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
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

  // If id is "blog"
  if (cleanId === 'blog') {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, created_at, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    const postList = posts || [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${postList
  .map(
    (post: any) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || post.created_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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

  // Numeric id => game chunk (e.g. 1 => 0-999, 2 => 1000-1999)
  const pageNum = parseInt(cleanId, 10) || 1;
  const start = (pageNum - 1) * CHUNK_SIZE;
  const end = start + CHUNK_SIZE - 1;

  const { data: games } = await supabase
    .from('games')
    .select('slug, title, image_url, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(start, end);

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
