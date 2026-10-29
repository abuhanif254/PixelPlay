export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';
import { getAllBlogPosts } from '@/lib/blogData';

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
  const seenSlugs = new Set<string>();
  const postList: Array<{ slug: string; title: string; image?: string; lastmod: string }> = [];

  // 1. Add static curated blog articles
  try {
    for (const post of getAllBlogPosts()) {
      if (post.slug && !seenSlugs.has(post.slug)) {
        seenSlugs.add(post.slug);
        postList.push({
          slug: post.slug,
          title: post.title || post.slug,
          image: post.coverImage,
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
      .select('slug, title, cover_image, created_at, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && posts) {
      for (const p of posts) {
        if (p.slug && !seenSlugs.has(p.slug)) {
          seenSlugs.add(p.slug);
          postList.push({
            slug: p.slug,
            title: p.title || p.slug,
            image: p.cover_image,
            lastmod: new Date(p.updated_at || p.created_at || Date.now()).toISOString(),
          });
        }
      }
    }
  } catch (err) {
    console.error('Blog sitemap unexpected error:', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${postList
  .map((post) => {
    const imageTag = post.image
      ? `\n    <image:image>
      <image:loc>${escapeXml(post.image)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>`
      : '';

    return `  <url>
    <loc>${baseUrl}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageTag}
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
