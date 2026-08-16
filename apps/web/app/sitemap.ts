import { MetadataRoute } from 'next';
import { gamesRegistry } from '@spielcade/games/registry';
import { siteConfig } from '@/lib/seo';
import { getAllBlogPosts } from '@/lib/blogData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Map all games from the registry
  const gameUrls = Object.keys(gamesRegistry).map((slug) => ({
    url: `${baseUrl}/games/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Extract unique categories
  const categories = new Set<string>();
  Object.values(gamesRegistry).forEach(game => {
    if (game.config.category) {
      categories.add(game.config.category);
    }
  });

  const categoryUrls = Array.from(categories).map(category => ({
    url: `${baseUrl}/categories/${category.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Define static routes
  const staticRoutes = [
    '',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.7,
  }));

  // Generate blog URLs from the local registry
  const blogSlugs = getAllBlogPosts().map(post => post.slug);

  const blogUrls = blogSlugs.map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryUrls, ...gameUrls, ...blogUrls];
}
