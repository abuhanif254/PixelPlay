import { Metadata } from 'next';
import PopularGamesClient from './PopularGamesClient';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const revalidate = 300; // 5-minute Edge CDN caching

export const metadata: Metadata = {
  title: 'Most Popular Free Games Online (No Download) | Spielcade',
  description: 'Play the most popular online games for free on Spielcade. Top-rated action, racing, puzzle, and multiplayer games with zero install.',
  alternates: {
    canonical: 'https://spielcade.com/popular',
  },
  openGraph: {
    title: 'Most Popular Free Games Online | Spielcade',
    description: 'Play the most popular online games for free on Spielcade. Top-rated action, racing, puzzle, and multiplayer games with zero install.',
    url: 'https://spielcade.com/popular',
    siteName: 'Spielcade Games',
    type: 'website',
  },
};

export default async function PopularGamesPage() {
  const supabase = createClient();
  
  // Fetch up to 100 most popular active games with targeted projection
  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, description, category, image_url, total_plays, rating, created_at')
    .eq('status', 'active')
    .order('total_plays', { ascending: false })
    .limit(100);

  const initialGames = (games || []).map(game => ({
    id: game.id,
    title: game.title,
    slug: game.slug,
    description: game.description,
    category: game.category,
    image: game.image_url,
    totalPlays: game.total_plays,
    rating: game.rating,
    created_at: game.created_at
  }));

  // Google ItemList Carousel Schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Most Popular Games on Spielcade',
    description: 'Top-rated and most played free online browser games.',
    itemListElement: initialGames.slice(0, 30).map((game, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://spielcade.com/games/${game.slug}`,
      name: game.title,
      image: game.image || 'https://spielcade.com/og-default.jpg',
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://spielcade.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Popular Games',
        item: 'https://spielcade.com/popular',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-20 pb-12 font-sans transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PopularGamesClient initialGames={initialGames} />
    </div>
  );
}
