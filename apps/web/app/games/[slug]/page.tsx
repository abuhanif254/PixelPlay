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

export const runtime = 'edge';

interface GamePageProps {
  params: {
    slug: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  const { slug } = params;
  const game = gamesRegistry[slug];

  if (!game) {
    notFound();
  }

  const { config, component: GameComponent } = game;

  // Grab some dummy related games (just pulling first 12 from registry, or repeating if less than 12)
  const registryArray = Object.entries(gamesRegistry);
  const relatedGames = Array.from({ length: 12 }).map((_, i) => {
    const entry = registryArray[i % registryArray.length];
    return { slug: entry[0], ...entry[1].config };
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 flex flex-col gap-10">
      
      {/* 1. Breadcrumb */}
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

      {/* 2. Title & Rating */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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

      {/* 3. Play Button & Game Canvas Section */}
      <section>
        <GamePlayer title={config.title} image={config.image}>
          <GameComponent />
        </GamePlayer>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* 4. SEO Section */}
          <SEOContent config={config as any} />
          
          {/* 5. FAQs */}
          <FAQSection faqs={(config as any).faqs} />

          {/* 6. Comments (Future Feature Placeholder) */}
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-primary" size={24} />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Comments</h3>
            </div>
            <div className="p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50">
               <MessageSquare size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
               <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join the Conversation</h4>
               <p className="text-gray-500 dark:text-gray-400 max-w-md">
                 Our interactive comments section is currently being built. Soon you will be able to share your thoughts, strategies, and high scores here!
               </p>
               <button className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-full cursor-not-allowed opacity-50">
                 Coming Soon
               </button>
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          
          {/* Leaderboard (Future Feature Placeholder) */}
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
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
                       <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                       <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                     </div>
                     <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                   </div>
                 ))}
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-sm z-20">
                 <span className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-full shadow-lg">Global Leaderboards</span>
                 <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-2">Dropping in Phase 4</p>
               </div>
             </div>
          </div>

          {/* Achievements (Future Feature Placeholder) */}
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3 mb-4">
               <Medal className="text-accent" size={24} />
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
             </div>
             <div className="grid grid-cols-3 gap-3 mb-4 opacity-50 blur-[1px]">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                   <Medal size={24} className="text-gray-400 dark:text-gray-600" />
                 </div>
               ))}
             </div>
             <div className="text-center">
               <span className="inline-block px-4 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-bold rounded-full">Coming Soon</span>
             </div>
          </div>
        </div>
      </div>

      {/* 7. Related Games (12 Items) */}
      <section className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">More like {config.title}</h2>
          <Link href={`/games/category/${config.category.toLowerCase()}`} className="text-primary font-medium hover:underline">
            View all {config.category}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {relatedGames.map((game, i) => (
             <Link href={`/games/${game.slug}`} key={i}>
               <GameCard title={game.title} rating={game.rating} />
             </Link>
          ))}
        </div>
      </section>

      {/* 8. Blog Articles */}
      <section className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Guides & Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BlogPreviewCard title={`Mastering ${config.title}`} date="Aug 10, 2026" readTime="5 min read" excerpt="Learn the best strategies to dominate the game." />
          <BlogPreviewCard title="Top 10 Arcade Games" date="Aug 8, 2026" readTime="8 min read" excerpt="A definitive list of games you shouldn't miss." />
          <BlogPreviewCard title="Speedrunning Tips" date="Aug 5, 2026" readTime="4 min read" excerpt="How to beat your personal best effectively." />
          <BlogPreviewCard title="Browser Games History" date="Aug 2, 2026" readTime="6 min read" excerpt="The evolution from Flash to modern HTML5 engines." />
        </div>
      </section>

    </div>
  );
}
