import React from 'react';
import { notFound } from 'next/navigation';
import { gamesRegistry } from '@pixelplay/games/registry';
import { Star, ChevronRight, MessageSquare, Trophy, Medal } from 'lucide-react';
import Link from 'next/link';
import GamePlayer from '@/components/GamePlayer';
import SEOContent from '@/components/SEOContent';
import FAQSection from '@/components/FAQSection';
import GameCard from '@/components/GameCard';
import BlogPreviewCard from '@/components/BlogPreviewCard';
import { Metadata, ResolvingMetadata } from 'next';

export const runtime = 'edge';

interface GamePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: GamePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const game = gamesRegistry[slug];

  if (!game) {
    return {
      title: 'Game Not Found - PlayHub',
    };
  }

  const { config } = game;
  const title = `Play ${config.title} Online Free - PlayHub`;
  const description = config.description || `Play ${config.title} online for free. No downloads required.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: config.image ? [{ url: config.image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: config.image ? [config.image] : [],
    },
  };
}

export default function GamePage({ params }: GamePageProps) {
  const { slug } = params;
  const game = gamesRegistry[slug];

  if (!game) {
    notFound();
  }

  const { config, component: GameComponent } = game;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: config.title,
    description: config.description,
    genre: config.category,
    playMode: 'SinglePlayer',
    applicationCategory: 'BrowserGame',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: config.rating || 5.0,
      bestRating: 5.0,
      ratingCount: Math.floor(Math.random() * 1000) + 100, // Dummy data
    },
    image: config.image,
  };

  // Grab some dummy related games (just pulling first 12 from registry, or repeating if less than 12)
  const registryArray = Object.entries(gamesRegistry);
  const relatedGames = Array.from({ length: 12 }).map((_, i) => {
    const entry = registryArray[i % registryArray.length];
    return { slug: entry[0], ...entry[1].config };
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-white dark:bg-[#0A0B1A] min-h-screen">
        
        {/* TOP METADATA & BREADCRUMBS */}
        <div className="container mx-auto px-4 md:px-8 pt-6 pb-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/games" className="hover:text-primary transition-colors">Games</Link>
            <ChevronRight size={14} />
            <Link href={`/games/category/${config.category.toLowerCase()}`} className="hover:text-primary transition-colors">
              {config.category}
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 dark:text-white">{config.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                {config.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/games/category/${config.category.toLowerCase()}`} className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors">
                  {config.category}
                </Link>
                <div className="flex items-center gap-1.5 text-warning font-semibold bg-warning/10 px-3 py-1 rounded-full">
                  <Star size={16} className="fill-current" />
                  {config.rating || 'New'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THEATER MODE GAME PLAYER (FULL BLEED OPTION) */}
        <section className="w-full bg-gray-100 dark:bg-[#12132A] border-y border-black/5 dark:border-white/5 shadow-2xl py-8">
          <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
            <GamePlayer title={config.title} slug={slug} image={config.image}>
              <GameComponent />
            </GamePlayer>
          </div>
        </section>

        {/* BOTTOM CONTENT */}
        <div className="container mx-auto px-4 md:px-8 py-10 flex flex-col gap-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-12">
              
              <SEOContent config={config as any} />
              <FAQSection faqs={(config as any).faqs} />

              {/* Comments (Future Feature Placeholder) */}
              <section className="mt-12 pt-8 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="text-primary" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Comments</h3>
                </div>
                <div className="p-12 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#12132A]">
                   <MessageSquare size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                   <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join the Conversation</h4>
                   <p className="text-gray-500 dark:text-gray-400 max-w-md">
                     Our interactive comments section is currently being built. Soon you will be able to share your thoughts, strategies, and high scores here!
                   </p>
                   <button className="mt-6 px-6 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white font-medium rounded-full cursor-not-allowed opacity-50 transition-colors">
                     Coming Soon
                   </button>
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              
              {/* Leaderboard */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12132A] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] z-0"></div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                     <Trophy className="text-warning" size={24} />
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h3>
                   </div>
                   <div className="space-y-4 mb-6 blur-[2px] opacity-70 select-none">
                     {[1, 2, 3, 4, 5].map((i) => (
                       <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <span className="text-sm font-bold text-gray-500">#{i}</span>
                           <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-white/10"></div>
                           <div className="h-4 w-20 bg-gray-300 dark:bg-white/10 rounded"></div>
                         </div>
                         <div className="h-4 w-12 bg-gray-300 dark:bg-white/10 rounded"></div>
                       </div>
                     ))}
                   </div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-[#12132A]/60 backdrop-blur-sm z-20">
                     <span className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-full shadow-lg">Global Leaderboards</span>
                     <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-2">Dropping in Phase 4</p>
                   </div>
                 </div>
              </div>

              {/* Achievements */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12132A] border border-black/5 dark:border-white/5 shadow-xl">
                 <div className="flex items-center gap-3 mb-4">
                   <Medal className="text-accent" size={24} />
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
                 </div>
                 <div className="grid grid-cols-3 gap-3 mb-4 opacity-50 blur-[1px]">
                   {[1, 2, 3, 4, 5, 6].map((i) => (
                     <div key={i} className="aspect-square bg-gray-100 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center">
                       <Medal size={24} className="text-gray-400 dark:text-gray-500" />
                     </div>
                   ))}
                 </div>
                 <div className="text-center">
                   <span className="inline-block px-4 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-full">Coming Soon</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Related Games (Fixed Double Link Bug) */}
          <section className="mt-16 pt-16 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">More like {config.title}</h2>
              <Link href={`/games/category/${config.category.toLowerCase()}`} className="text-primary font-medium hover:underline">
                View all {config.category}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedGames.map((game, i) => (
                <div key={i}>
                  <GameCard title={game.title} rating={game.rating} category={game.category} slug={game.slug} />
                </div>
              ))}
            </div>
          </section>

          {/* Blog Articles */}
          <section className="mt-16 pt-16 border-t border-black/5 dark:border-white/5">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Guides & Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BlogPreviewCard title={`Mastering ${config.title}`} date="Aug 10, 2026" readTime="5 min read" excerpt="Learn the best strategies to dominate the game." />
              <BlogPreviewCard title="Top 10 Arcade Games" date="Aug 8, 2026" readTime="8 min read" excerpt="A definitive list of games you shouldn't miss." />
              <BlogPreviewCard title="Speedrunning Tips" date="Aug 5, 2026" readTime="4 min read" excerpt="How to beat your personal best effectively." />
              <BlogPreviewCard title="Browser Games History" date="Aug 2, 2026" readTime="6 min read" excerpt="The evolution from Flash to modern HTML5 engines." />
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
