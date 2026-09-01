export const runtime = 'edge';
export const revalidate = 3600;

import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  const { data: categoryData } = await supabase
    .from('games')
    .select('category')
    .eq('status', 'active');

  const defaultCategories = ['Action', 'Puzzle', 'Arcade', 'Racing', 'Board', 'Strategy', 'Sports', 'Adventure'];
  const dbCategories = (categoryData || []).map((g: any) => g.category).filter(Boolean);
  const categories = Array.from(new Set([...defaultCategories, ...dbCategories]));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories
  .map((cat) => {
    const slug = cat.toLowerCase().replace(/\s+/g, '-');
    return `  <url>
    <loc>${baseUrl}/categories/${slug}-games</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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
