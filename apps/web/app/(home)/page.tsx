import { Metadata } from 'next';
import { Puzzle, Gamepad2, Grid, Swords, Car, Brain } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { CategoriesCarousel } from '@/components/CategoriesCarousel';
import { SectionHeader } from '@/components/SectionHeader';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import GameCard from '@/components/GameCard';
import CategoryCard from '@/components/CategoryCard';
import BlogPreviewCard from '@/components/BlogPreviewCard';
import { gamesRegistry } from '@spielcade/games/registry';
import Link from 'next/link';
import RecentGames from '@/components/RecentGames';
import { TrendingGamesFilter } from '@/components/TrendingGamesFilter';
import { ScrollReveal } from '@/components/ScrollReveal';
import HomeSEOText from '@/components/HomeSEOText';
import HomeFAQ from '@/components/HomeFAQ';
import PopularSearches from '@/components/PopularSearches';
import { homepageFaqs, gameCollections } from '@/lib/constants';
import { getAllPosts } from '@/lib/blog';
import { FireIcon, RocketIcon, CubeIcon, RingsIcon } from '@/components/3d/SectionIcons';
import dynamic from 'next/dynamic';

const CollectionCard = dynamic(() => import('@/components/CollectionCard'));
const ReviewTicker = dynamic(() => import('@/components/ReviewTicker'));
const LeaderboardPreview = dynamic(() => import('@/components/LeaderboardPreview'));
const DeviceCompatibility = dynamic(() => import('@/components/DeviceCompatibility'));
const DeveloperSpotlight = dynamic(() => import('@/components/DeveloperSpotlight'));
const UpcomingGames = dynamic(() => import('@/components/UpcomingGames'));
export const metadata: Metadata = {
  title: "Spielcade — Play Free Games, Publish Yours & Earn",
  description: "Play free online games — from lightweight HTML5 to premium titles. Submit your own game as a developer on Spielcade and start earning from every view.",
  openGraph: {
    title: "Spielcade — Play Free Games, Publish Yours & Earn",
    description: "Play free online games — from lightweight HTML5 to premium titles. Submit your own game as a developer on Spielcade and start earning from every view.",
  },
};

export default async function HomePage() {
  const blogPosts = await getAllPosts();

  // Convert registry object to an array for rendering
  const gamesList = Object.entries(gamesRegistry).map(([slug, game]) => ({
    slug,
    title: game.config.title,
    rating: game.config.rating || 4.5,
    category: game.config.category || 'Arcade',
    image: game.config.image,
  }));

  const categories = [
    { title: "Puzzle", icon: Puzzle, count: 120 },
    { title: "Arcade", icon: Gamepad2, count: 85 },
    { title: "Board", icon: Grid, count: 40 },
    { title: "Action", icon: Swords, count: 200 },
    { title: "Racing", icon: Car, count: 55 },
    { title: "Strategy", icon: Brain, count: 90 },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Spielcade Game Collection',
        description: 'A collection of the best free browser games.',
        url: 'https://spielcade.com',
        hasPart: gamesList.map(game => ({
          '@type': 'SoftwareApplication',
          name: game.title,
          applicationCategory: 'Game',
          operatingSystem: 'Any',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: game.rating,
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
      },
      {
        '@type': 'ItemList',
        name: 'Curated Game Collections',
        itemListElement: gameCollections.map((col, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `https://spielcade.com${col.href}`
        }))
      }
    ]
  };

  return (
    <div className="flex flex-col gap-16 pb-20 bg-white dark:bg-[#0A0B1A] min-h-screen text-gray-900 dark:text-white relative">
      {/* Ambient Background Glows */}
      <div className="absolute top-[20%] left-[0%] w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] right-[0%] w-[40vw] h-[40vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <HeroSection />
      <CategoriesCarousel />

      <div className="container mx-auto px-4 md:px-8 space-y-24 relative z-10">
        {/* Continue Playing (Dynamic from localStorage) */}
        <ScrollReveal>
          <RecentGames />
        </ScrollReveal>

        {/* New Arrivals */}
        <ScrollReveal delay={0.1}>
          <section aria-labelledby="new-arrivals-heading">
            <div id="new-arrivals-heading" className="sr-only">New Arrivals</div>
            <SectionHeader title="New Arrivals" actionText="View Latest" icon3d={<RocketIcon />} />
            <HorizontalScroll>
              {gamesList.slice(0, 5).map((game, i) => (
                <div key={i} className="w-64 flex-none shrink-0 relative">
                  <div className="absolute top-2 left-2 bg-accent text-black text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm pointer-events-none">NEW</div>
                  <GameCard title={game.title} rating={game.rating} category={game.category} slug={game.slug} />
                </div>
              ))}
            </HorizontalScroll>
          </section>
        </ScrollReveal>

        {/* Trending Games */}
        <ScrollReveal delay={0.1}>
          <section aria-labelledby="trending-games-heading">
            <div id="trending-games-heading" className="sr-only">Trending Games</div>
            <SectionHeader title="Trending Games" subtitle="Most played games right now" actionText="View All ->" icon3d={<FireIcon />} />
            <TrendingGamesFilter games={gamesList} />
          </section>
        </ScrollReveal>

        {/* Categories */}
        <ScrollReveal delay={0.1}>
          <section aria-labelledby="categories-heading">
            <div id="categories-heading" className="sr-only">Popular Categories</div>
            <SectionHeader title="Popular Categories" actionText="Explore" icon3d={<CubeIcon />} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                 <CategoryCard key={i} name={cat.title} icon={<cat.icon className="w-6 h-6" />} gameCount={cat.count} />
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Top Rated & Multiplayer */}
        <ScrollReveal delay={0.2}>
          <div className="grid lg:grid-cols-2 gap-12">
            <section aria-labelledby="top-rated-heading">
              <div id="top-rated-heading" className="sr-only">Top Rated Games</div>
              <SectionHeader title="Hall of Fame" actionText="Highest Rated" icon3d={<FireIcon />} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {gamesList.slice(0, 3).map((game, i) => (
                   <GameCard key={i} title={game.title} rating={4.9} category={game.category} slug={game.slug} />
                 ))}
              </div>
            </section>
            
            <section aria-labelledby="multiplayer-heading">
              <div id="multiplayer-heading" className="sr-only">Multiplayer Games</div>
              <SectionHeader title="⚔️ Multiplayer Chaos" actionText="Play with Friends" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {gamesList.slice(0, 3).map((game, i) => (
                   <GameCard key={i} title={`${game.title} Online`} rating={game.rating} category={game.category} slug={game.slug} />
                 ))}
              </div>
            </section>
          </div>
        </ScrollReveal>

        {/* Featured / Editor's Picks */}
        <ScrollReveal delay={0.2}>
          <section aria-labelledby="editors-picks-heading">
            <div id="editors-picks-heading" className="sr-only">Editor's Picks</div>
            <SectionHeader title="Editor's Picks" subtitle="Hand-picked gems for you" icon3d={<RingsIcon />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                 <GameCard title="Ultimate Chess" rating={5.0} />
              </div>
              <div className="md:col-span-1">
                 <GameCard title="Cyberpunk Racing" rating={4.9} />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Curated Collections */}
        <ScrollReveal delay={0.2}>
          <section aria-labelledby="collections-heading">
            <div id="collections-heading" className="sr-only">Curated Collections</div>
            <SectionHeader title="Curated Collections" actionText="Browse All" icon3d={<CubeIcon />} />
            <div className="grid md:grid-cols-3 gap-6">
              {gameCollections.map((col, i) => (
                <CollectionCard key={i} title={col.title} description={col.description} imageUrls={col.imageUrls} href={col.href} />
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Games by Device */}
        <ScrollReveal delay={0.3}>
          <section aria-labelledby="device-heading">
            <div id="device-heading" className="sr-only">Device Compatibility</div>
            <DeviceCompatibility />
          </section>
        </ScrollReveal>

        {/* Genre Deep Dive */}
        <ScrollReveal delay={0.2}>
          <section aria-labelledby="genre-action-heading">
            <div id="genre-action-heading" className="sr-only">Action Games Hub</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Swords className="w-8 h-8" /></div>
              <div>
                <h2 className="text-2xl font-outfit font-bold">Action Games Hub</h2>
                <p className="text-gray-500 text-sm">Jump into the most thrilling combat and adventure games.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gamesList.slice(0, 4).map((game, i) => (
                <GameCard key={i} title={game.title} rating={game.rating} category={game.category} slug={game.slug} />
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Blog Section for SEO */}
        <ScrollReveal delay={0.2}>
          <section aria-labelledby="guides-heading">
            <div id="guides-heading" className="sr-only">Latest Guides and News</div>
            <SectionHeader 
              title="Latest Guides & News" 
              actionText="Read more" 
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

        {/* Community & Live Data Grid */}
        <ScrollReveal delay={0.3}>
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <ReviewTicker />
              <DeveloperSpotlight />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-8">
              <LeaderboardPreview />
              <UpcomingGames />
            </div>
          </div>
        </ScrollReveal>

        {/* SEO Text Block */}
        <ScrollReveal delay={0.2}>
          <section className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 md:p-12 border border-black/5 dark:border-white/5" aria-labelledby="seo-text-heading">
            <div id="seo-text-heading" className="sr-only">About Spielcade</div>
            <HomeSEOText />
          </section>
        </ScrollReveal>

        {/* Popular Searches & FAQ */}
        <ScrollReveal delay={0.3}>
          <section className="grid md:grid-cols-12 gap-12" aria-labelledby="faq-search-heading">
            <div id="faq-search-heading" className="sr-only">FAQs and Popular Searches</div>
            <div className="md:col-span-8">
              <HomeFAQ />
            </div>
            <div className="md:col-span-4">
              <PopularSearches />
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
