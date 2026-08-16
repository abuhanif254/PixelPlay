import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const baseUrl = 'https://spielcade.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // 1. Fetch all published games
  const { data: games } = await supabase
    .from('games')
    .select('slug, updated_at')
    .eq('is_published', true);

  // 2. Fetch all published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  // 3. Map into sitemap format
  const gameEntries: MetadataRoute.Sitemap = (games || []).map((game) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: new Date(game.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Static routes
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }
  ];

  return [...staticEntries, ...gameEntries, ...postEntries];
}
