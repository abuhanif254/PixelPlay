export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  const [{ data: games }, { data: posts }] = await Promise.all([
    supabase
      .from('games')
      .select('title, slug, description, category, image_url, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(40),
    supabase
      .from('blog_posts')
      .select('title, slug, excerpt, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const gameItems = (games || []).map((game: any) => {
    const link = `${baseUrl}/games/${game.slug}`;
    const pubDate = new Date(game.created_at || Date.now()).toUTCString();
    const mediaTag = game.image_url ? `<media:thumbnail url="${escapeXml(game.image_url)}" />` : '';

    return `    <item>
      <title>${escapeXml(game.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(game.description || `Play ${game.title} online for free on Spielcade with zero downloads.`)}</description>
      <category>${escapeXml(game.category || 'Arcade')}</category>
      ${mediaTag}
    </item>`;
  });

  const postItems = (posts || []).map((post: any) => {
    const link = `${baseUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.created_at || Date.now()).toUTCString();

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt || post.title)}</description>
      <category>Blog</category>
    </item>`;
  });

  const allItems = [...gameItems, ...postItems].join('\n');
  const lastBuildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom" 
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Spielcade — Free Online Browser Games</title>
    <link>${baseUrl}</link>
    <description>Play thousands of free online browser games instantly with zero downloads. Unblocked action, car, zombie, puzzle, and multiplayer games.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${allItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}