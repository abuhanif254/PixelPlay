export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';
import { getAllBlogPosts } from '@/lib/blogData';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

export async function GET() {
  const seenSlugs = new Set<string>();
  const postList: Array<{ slug: string; lastmod: string }> = [];

  // 1. Add static curated blog articles
  try {
    for (const post of getAllBlogPosts()) {
      if (post.slug && !seenSlugs.has(post.slug)) {
        seenSlugs.add(post.slug);
        postList.push({
          slug: post.slug,
          lastmod: new Date(post.date || Date.now()).toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('[BlogSitemap] Error reading curated posts:', err);
  }

  // 2. Add published database blog posts if any exist
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, created_at, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && posts) {
      for (const p of posts) {
        if (p.slug && !seenSlugs.has(p.slug)) {
          seenSlugs.add(p.slug);
          postList.push({
            slug: p.slug,
            lastmod: new Date(p.updated_at || p.created_at || Date.now()).toISOString(),
          });
        }
      }
    }
  } catch (err) {
    console.error('Blog sitemap unexpected error:', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${postList
  .map(
    (post) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
