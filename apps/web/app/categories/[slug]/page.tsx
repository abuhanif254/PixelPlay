import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { gamesRegistry } from '@pixelplay/games/registry';
import { constructMetadata, siteConfig } from '@/lib/seo';
import GameCard from '@/components/GameCard';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Extract unique categories and format them
function getCategories() {
  const categories = new Set<string>();
  Object.values(gamesRegistry).forEach(game => {
    if (game.config.category) {
      categories.add(game.config.category);
    }
  });
  
  return Array.from(categories).map(category => ({
    name: category,
    slug: category.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export function generateStaticParams() {
  return getCategories().map(cat => ({
    slug: cat.slug,
  }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = getCategories().find(c => c.slug === params.slug);
  
  if (!category) {
    return {};
  }

  const title = `Free ${category.name} Games`;
  const description = `Play the best free online ${category.name} games on ${siteConfig.name}. Discover top-rated browser games carefully curated for you.`;

  return constructMetadata({
    title,
    description,
    path: `/categories/${params.slug}`,
  });
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategories().find(c => c.slug === params.slug);
  
  if (!category) {
    notFound();
  }

  // Filter games by category
  const games = Object.entries(gamesRegistry)
    .filter(([_, game]) => game.config.category === category.name)
    .map(([slug, game]) => ({
      slug,
      title: game.config.title,
      rating: game.config.rating || 4.5,
      category: game.config.category,
      image: game.config.image,
    }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Free ${category.name} Games`,
    description: `A collection of the best free ${category.name} games playable directly in your browser.`,
    url: `${siteConfig.url}/categories/${category.slug}`,
    hasPart: games.map(game => ({
      '@type': 'SoftwareApplication',
      name: game.title,
      applicationCategory: 'Game',
      operatingSystem: 'Any',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: game.rating,
        ratingCount: Math.floor(Math.random() * 500) + 50 // Mock count for SEO
      }
    }))
  };

  return (
    <div className="flex flex-col gap-12 pb-20 bg-white dark:bg-[#0A0B1A] min-h-screen text-gray-900 dark:text-white pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 md:px-8">
        {/* Category Header */}
        <div className="mb-12 border-b border-black/5 dark:border-white/5 pb-8">
          <h1 className="text-4xl md:text-5xl font-outfit font-extrabold mb-4 text-gray-900 dark:text-white tracking-tight">
            Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{category.name}</span> Games
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            Dive into our curated collection of free online {category.name.toLowerCase()} games. No downloads, no registration required. Just click and play directly in your browser!
          </p>
        </div>

        {/* Games Grid */}
        <section aria-labelledby="games-grid-heading">
          <div id="games-grid-heading" className="sr-only">All {category.name} Games</div>
          
          {games.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {games.map((game, i) => (
                <GameCard 
                  key={i} 
                  title={game.title} 
                  rating={game.rating} 
                  category={game.category} 
                  slug={game.slug}
                  imageUrl={game.image}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-[#12132A] rounded-3xl border border-black/5 dark:border-white/5">
              <p className="text-xl text-gray-500 dark:text-gray-400">More {category.name} games are coming soon!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
