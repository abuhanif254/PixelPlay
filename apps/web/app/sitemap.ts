export const runtime = 'edge';
export const revalidate = 3600; // Cache sitemap for 1 hour on Cloudflare Edge

import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';
const CHUNK_SIZE = 1000;

export async function generateSitemaps() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const gamesCount = totalGames || 0;
  const numChunks = Math.max(1, Math.ceil(gamesCount / CHUNK_SIZE));

  const sitemaps: { id: number }[] = [{ id: 0 }];
  for (let i = 1; i <= numChunks; i++) {
    sitemaps.push({ id: i });
  }

  return sitemaps;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  if (Number(id) === 0) {
    // 1. Static Pages
    const staticEntries: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/games`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
      { url: `${baseUrl}/popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/developers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    // 2. Category Pages
    const { data: categoryData } = await supabase
      .from('games')
      .select('category')
      .eq('status', 'active');

    const defaultCategories = ['Action', 'Puzzle', 'Arcade', 'Racing', 'Board', 'Strategy', 'Sports', 'Adventure'];
    const dbCategories = (categoryData || []).map((g: any) => g.category).filter(Boolean);
    const categories = Array.from(new Set([...defaultCategories, ...dbCategories]));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/categories/${cat.toLowerCase().replace(/\s+/g, '-')}-games`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...staticEntries, ...categoryEntries];
  }

  // Games chunk: id = 1 => 0 to 4999, id = 2 => 5000 to 9999, etc.
  const chunkIndex = Number(id) || 1;
  const start = (chunkIndex - 1) * CHUNK_SIZE;
  const end = start + CHUNK_SIZE - 1;

  const { data: games, error } = await supabase
    .from('games')
    .select('slug, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Sitemap chunk query error:', error);
  }

  return (games || []).map((game: any) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: new Date(game.created_at || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
