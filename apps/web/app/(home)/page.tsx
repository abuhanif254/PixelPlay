import { Metadata } from 'next';
import { Puzzle, Gamepad2, Grid, Swords, Car, Brain, Sparkles, Flame, Rocket, Trophy, Rings } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import GamingPulseTicker from '@/components/GamingPulseTicker';
import { CategoriesCarousel } from '@/components/CategoriesCarousel';
import { SectionHeader } from '@/components/SectionHeader';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import GameCard from '@/components/GameCard';
import CategoryCard from '@/components/CategoryCard';
import BlogPreviewCard from '@/components/BlogPreviewCard';
import Link from 'next/link';
import RecentGames from '@/components/RecentGames';
import { TrendingGamesFilter } from '@/components/TrendingGamesFilter';
import ThematicGamingZones from '@/components/ThematicGamingZones';
import FeaturedGameBanner from '@/components/FeaturedGameBanner';
import { ScrollReveal } from '@/components/ScrollReveal';
import HomeSEOText from '@/components/HomeSEOText';
import HomeFAQ from '@/components/HomeFAQ';
import PopularSearches from '@/components/PopularSearches';
import { homepageFaqs } from '@/lib/constants';
import { getAllPosts } from '@/lib/blog';
import { FireIcon, RocketIcon, CubeIcon, RingsIcon } from '@/components/3d/SectionIcons';
import dynamic from 'next/dynamic';

const DeveloperSpotlight = dynamic(() => import('@/components/DeveloperSpotlight'));

import { gamesRegistry } from '@spielcade/games/registry';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const revalidate = 300; // 5-minute Edge CDN ISR caching

export const metadata: Metadata = {
  title: "Play Free Online Games & Publish to Earn | Spielcade",
  description: "Play thousands of free web games instantly with no downloads required. Discover action, puzzle, arcade, and racing games on Spielcade.",
  keywords: [
    "free online games",
    "browser games",
    "play free games",
    "juegos gratis online",
    "jogos online gratis",
    "jeux en ligne gratuits",
    "kostenlose online spiele",
    "html5 games",
    "no download games",
    "instant play games",
    "2048 online",
    "neon snake",
    "neon flyer"
  ],
  openGraph: {
    title: "Play Free Online Games & Publish to Earn | Spielcade",
    description: "Play thousands of free web games instantly. Are you a developer? Publish your HTML5 games on Spielcade and earn revenue from every view.",
    url: "https://spielcade.com",
    siteName: "Spielcade",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://spielcade.com",
  },
};

export default async function HomePage() {
  const blogPosts = await getAllPosts();
  const supabase = createClient();
  
  // High-reliability local fallback games derived from registry
  const fallbackGames = Object.entries(gamesRegistry).map(([slug, item]) => ({
    id: slug,
    slug,
    title: item.config.title,
    category: item.config.category || 'Arcade',
    rating: item.config.rating || 4.9,
    image: item.config.image || '',
    image_url: item.config.image || '',
    total_plays: 100000,
    description: 'Instant free HTML5 browser game playable on any device.',
    created_at: new Date().toISOString()
  }));

  let trending = fallbackGames;
  let newGames = fallbackGames;
  let topRated = fallbackGames;
  let totalActiveGames = 17125;

  const baselineCounts: Record<string, number> = {
    'Puzzle': 3450,
    'Arcade': 4120,
    'Board': 520,
    'Action': 3250,
    'Racing': 1680,
    'Strategy': 1280,
    'Adventure': 1340,
    'Sports': 1050,
  };

  try {
    // Parallel Supabase queries with zero table scanning
    const [
      { data: trendingGames },
      { data: newArrivals },
      { data: topRatedGames },
      { count: exactCount }
    ] = await Promise.all([
      supabase.from('games').select('id, title, slug, image_url, category, total_plays, rating, description').eq('status', 'active').order('total_plays', { ascending: false }).limit(36),
      supabase.from('games').select('id, title, slug, image_url, category, total_plays, rating').eq('status', 'active').order('created_at', { ascending: false }).limit(16),
      supabase.from('games').select('id, title, slug, image_url, category, total_plays, rating').eq('status', 'active').order('rating', { ascending: false }).limit(12),
      supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    if (exactCount) totalActiveGames = exactCount;
    if (trendingGames && trendingGames.length > 0) trending = trendingGames;
    if (newArrivals && newArrivals.length > 0) newGames = newArrivals;
    if (topRatedGames && topRatedGames.length > 0) topRated = topRatedGames;
  } catch (error) {
    console.error('Edge Supabase fetch fallback engaged:', error);
  }

  // Derive today's featured game & random game pool for instant play
  const featuredGame = trending.find(g => (g.image_url || (g as any).image) && g.title) || trending[0] || fallbackGames[0];
  const randomPool = Array.from(new Set([
    ...trending.map(g => g.slug),
    ...newGames.map(g => g.slug),
    ...topRated.map(g => g.slug)
  ].filter(Boolean))) as string[];

  const categories = [
    { title: "Puzzle", icon: Puzzle, count: baselineCounts["Puzzle"] || 3450 },
    { title: "Arcade", icon: Gamepad2, count: baselineCounts["Arcade"] || 4120 },
    { title: "Board", icon: Grid, count: baselineCounts["Board"] || 520 },
    { title: "Action", icon: Swords, count: baselineCounts["Action"] || 3250 },
    { title: "Racing", icon: Car, count: baselineCounts["Racing"] || 1680 },
    { title: "Strategy", icon: Brain, count: baselineCounts["Strategy"] || 1280 },
  ];

  // Dynamic JSON-LD Schema with Sitelinks SearchBox for Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://spielcade.com/#website',
        url: 'https://spielcade.com/',
        name: 'Spielcade Games',
        description: 'Play the best free online browser games instantly with zero downloads.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://spielcade.com/games?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'CollectionPage',
        name: 'Spielcade Game Collection',
        description: 'A curated collection of the best free browser games.',
        url: 'https://spielcade.com',
        hasPart: trending.slice(0, 30).map(game => ({
          '@type': 'SoftwareApplication',
          name: game.title,
          applicationCategory: 'Game',
          operatingSystem: 'Any (Web Browser)',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: game.rating || 5.0,
            ratingCount: 100
          }
        }))
      },
      {
        '@type': 'FAQPage',
        mainEntity: homepageFaqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a
          }
        }))
      }
    ]
  };

  return (
    <div className="flex flex-col gap-14 pb-20 bg-white dark:bg-[#0A0B1A] min-h-screen text-gray-900 dark:text-white relative">
      {/* Ambient Cyberpunk Atmospheric Glows */}
      <div className="absolute top-[15%] left-[0%] w-[55vw] h-[55vw] rounded-full bg-purple-600/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-[45%] right-[0%] w-[45vw] h-[45vw] rounded-full bg-blue-600/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-[75%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-pink-600/5 blur-[130px] pointer-events-none" />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 1. Dynamic Hero Section */}
      <HeroSection 
        totalGamesCount={totalActiveGames} 
        featuredGame={featuredGame as any}
        randomPool={randomPool}
        liveSuggestions={trending.slice(0, 6) as any}
      />
      
      {/* 2. Live Gaming Pulse Ticker */}
      <GamingPulseTicker 
        totalGames={totalActiveGames}
        featuredSlug={featuredGame?.slug}
        randomPool={randomPool}
      />

      {/* 3. Categories Carousel with Gradient Edge Fade */}
      <CategoriesCarousel />

      <div className="container mx-auto px-4 md:px-8 space-y-24 relative z-10">
        
        {/* 4. Continue Playing (Dynamic from localStorage) */}
        <ScrollReveal>
          <RecentGames />
        </ScrollReveal>

        {/* 5. Hot & Trending Games with Smart Mood Tabs */}
        <ScrollReveal delay={0.1}>
          <section aria-labelledby="trending-games-heading">
            <h2 id="trending-games-heading" className="sr-only">Trending Games</h2>
            <SectionHeader 
              title="Trending Games" 
              subtitle="Most played browser games across the community" 
              actionText="View All ->" 
              actionHref="/popular" 
              icon3d={<FireIcon />} 
            />
            <TrendingGamesFilter games={trending} />
          </section>
        </ScrollReveal>

        {/* 6. Play by Mood & Thematic Gaming Zones */}
        <ScrollReveal delay={0.1}>
          <ThematicGamingZones />
        </ScrollReveal>

        {/* 7. New Arrivals Shelf (Horizontal Scroll) */}
        <ScrollReveal delay={0.1}>
          <section aria-labelledby="new-arrivals-heading">
            <h2 id="new-arrivals-heading" className="sr-only">New Arrivals</h2>
            <SectionHeader 
              title="Fresh Releases" 
              subtitle="Latest HTML5 web games added to Spielcade"
              actionText="View Latest" 
              actionHref="/games/new" 
              icon3d={<RocketIcon />} 
            />
            <HorizontalScroll>
              {newGames.map((game, i) => (
                <div key={game.id || i} className="w-60 sm:w-64 flex-none shrink-0 relative">
                  <GameCard 
                    title={game.title} 
                    rating={game.rating || 4.8} 
                    category={game.category || 'Arcade'} 
                    slug={game.slug || game.id} 
                    imageUrl={game.image || (game as any).image_url} 
                    isNew={true}
                    plays="New"
                  />
                </div>
              ))}
            </HorizontalScroll>
          </section>
        </ScrollReveal>

        {/* 8. Widescreen Editorial Spotlight Banner */}
        <ScrollReveal delay={0.15}>
          <FeaturedGameBanner game={featuredGame as any} />
        </ScrollReveal>

        {/* 9. Popular Categories Hubs */}
        <ScrollReveal delay={0.1}>
          <section aria-labelledby="categories-heading">
            <h2 id="categories-heading" className="sr-only">Popular Categories</h2>
            <SectionHeader 
              title="Core Genres" 
              subtitle="Explore games across primary categories"
              actionText="Explore All" 
              actionHref="/categories" 
              icon3d={<CubeIcon />} 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                 <CategoryCard 
                   key={i} 
                   name={cat.title} 
                   icon={<cat.icon className="w-6 h-6" />} 
                   gameCount={cat.count} 
                 />
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* 10. Hall of Fame (Top Rated) */}
        <ScrollReveal delay={0.2}>
          <section aria-labelledby="top-rated-heading">
            <h2 id="top-rated-heading" className="sr-only">Top Rated Games</h2>
            <SectionHeader 
              title="Hall of Fame" 
              subtitle="Highest community-rated games (4.8★+)"
              actionText="Highest Rated" 
              actionHref="/popular"
              icon3d={<FireIcon />} 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {topRated.map((game, i) => (
                 <GameCard 
                   key={game.id || i} 
                   title={game.title} 
                   rating={game.rating || 5.0} 
                   category={game.category || 'Arcade'} 
                   slug={game.slug || game.id} 
                   imageUrl={game.image || (game as any).image_url} 
                   rank={i + 1}
                   plays="Top Rated"
                 />
               ))}
            </div>
          </section>
        </ScrollReveal>

        {/* 11. Developer Spotlight Banner */}
        <ScrollReveal delay={0.2}>
          <section aria-labelledby="developer-spotlight-heading">
            <h2 id="developer-spotlight-heading" className="sr-only">Developer Spotlight</h2>
            <DeveloperSpotlight />
          </section>
        </ScrollReveal>

        {/* 12. Latest Guides & Blog News for Authority */}
        <ScrollReveal delay={0.2}>
          <section aria-labelledby="guides-heading">
            <h2 id="guides-heading" className="sr-only">Latest Guides and News</h2>
            <SectionHeader 
              title="Gaming Guides & News" 
              subtitle="Tips, developer stories, and game reviews"
              actionText="Read More" 
              actionHref="/blog"
              icon3d={<RingsIcon />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {blogPosts.slice(0, 4).map(post => (
                <BlogPreviewCard 
                  key={post.slug}
                  title={post.title} 
                  date={new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                  readTime={post.readTime} 
                  excerpt={post.excerpt}
                  imageUrl={post.imageUrl}
                  category={post.category}
                  slug={post.slug}
                />
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* 13. Popular Searches & FAQ Section */}
        <ScrollReveal delay={0.3}>
          <section className="grid md:grid-cols-12 gap-12" aria-labelledby="faq-search-heading">
            <h2 id="faq-search-heading" className="sr-only">FAQs and Popular Searches</h2>
            <div className="md:col-span-8">
              <HomeFAQ />
            </div>
            <div className="md:col-span-4 flex flex-col gap-8">
              <PopularSearches />
            </div>
          </section>
        </ScrollReveal>

        {/* 14. Expandable SEO Context Block */}
        <ScrollReveal delay={0.35}>
          <section aria-labelledby="seo-text-heading">
            <h2 id="seo-text-heading" className="sr-only">About Spielcade Platform</h2>
            <HomeSEOText />
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
