import React from 'react';
import { notFound } from 'next/navigation';
import { gamesRegistry } from '@pixelplay/games/registry';
import { Star, ChevronRight, Heart, Clock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import GamePlayer from '@/components/GamePlayer';
import GameDetailsTabs from '@/components/GameDetailsTabs';
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

  // Grab some dummy related games
  const registryArray = Object.entries(gamesRegistry);
  const relatedGames = Array.from({ length: 4 }).map((_, i) => {
    const entry = registryArray[i % registryArray.length];
    return { slug: entry[0], ...entry[1].config };
  });

  const mockPlays = `${(Math.random() * 2 + 1).toFixed(1)}M plays`;
  const mockVotes = `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}K votes`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-[#05050F] min-h-screen text-white pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-[#6366F1] font-bold mb-6">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight size={14} className="text-gray-500" />
            <Link href={`/games?category=${config.category}`} className="hover:underline">{config.category} Games</Link>
            <ChevronRight size={14} className="text-gray-500" />
            <span className="text-[#F59E0B]">{config.title}</span>
          </nav>

          {/* Game Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              {/* Game Icon */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#111228] border border-white/10 shrink-0 relative shadow-xl shadow-black/50">
                {config.image ? (
                  <img src={config.image} alt={config.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gradient-to-br from-[#111228] to-[#1D1B4B]">
                    {config.title.substring(0,2).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white tracking-wide">
                    {config.title}
                  </h1>
                  <span className="px-3 py-1 bg-[#111228] border border-[#6366F1]/30 text-[#6366F1] text-xs font-bold rounded-lg shadow-sm shadow-[#6366F1]/10">
                    {config.category}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-[#F59E0B]">
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current opacity-50" />
                    </div>
                    <span className="text-white font-bold ml-1">{config.rating || '4.6'}</span>
                    <span className="text-gray-500">({mockVotes})</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-500" />
                    <span>{mockPlays}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all text-sm font-bold text-gray-300 w-fit shrink-0">
              <Heart size={16} className="text-red-500" />
              Add to Favorites
            </button>
          </div>

          {/* Main Grid: Game Player & Info Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
            
            {/* Left Column: Player Area */}
            <div className="lg:col-span-8">
              <GamePlayer title={config.title} slug={slug} image={config.image}>
                <GameComponent />
              </GamePlayer>
            </div>

            {/* Right Column: Game Info Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* How to Play Box */}
              <div className="bg-[#111228] border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold font-outfit text-white mb-4">How to Play</h3>
                <div className="text-sm text-gray-300 leading-relaxed space-y-4">
                  {config.strategy ? (
                    <div dangerouslySetInnerHTML={{ __html: config.strategy }} />
                  ) : (
                    <>
                      <p>Use your arrow keys to move the tiles.</p>
                      <p>When two tiles with the same number touch, they merge into one!</p>
                      <p>Get the highest score possible to win the game.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Controls Box */}
              <div className="bg-[#111228] border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold font-outfit text-white mb-4">Controls</h3>
                
                {config.keyboardControls ? (
                  <ul className="space-y-3">
                    {Object.entries(config.keyboardControls).map(([key, action]) => (
                      <li key={key} className="flex items-center gap-3">
                        <kbd className="min-w-[28px] h-7 px-2 flex items-center justify-center bg-[#0A0B1A] border border-white/10 rounded-lg text-xs font-bold font-mono text-gray-300 shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                          {key}
                        </kbd>
                        <span className="text-sm text-gray-400">{action as React.ReactNode}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-[#0A0B1A] border border-white/10 rounded-lg text-gray-300 shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowUp size={14} />
                      </kbd>
                      <span className="text-sm text-gray-400">Move Up</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-[#0A0B1A] border border-white/10 rounded-lg text-gray-300 shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowDown size={14} />
                      </kbd>
                      <span className="text-sm text-gray-400">Move Down</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-[#0A0B1A] border border-white/10 rounded-lg text-gray-300 shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowLeft size={14} />
                      </kbd>
                      <span className="text-sm text-gray-400">Move Left</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <kbd className="w-7 h-7 flex items-center justify-center bg-[#0A0B1A] border border-white/10 rounded-lg text-gray-300 shadow-[0_2px_0_rgba(255,255,255,0.1)]">
                        <ArrowRight size={14} />
                      </kbd>
                      <span className="text-sm text-gray-400">Move Right</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Game Info Box */}
              <div className="bg-[#111228] border border-white/5 rounded-2xl p-6 shadow-xl flex-1">
                <h3 className="text-lg font-bold font-outfit text-white mb-4">Game Info</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Developer</span>
                    <span className="text-gray-300">PixelPlay</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Genre</span>
                    <span className="text-gray-300">{config.category}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Released</span>
                    <span className="text-gray-300">Aug 2026</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Platform</span>
                    <span className="text-gray-300">Browser</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Rating</span>
                    <span className="text-gray-300">4.6 / 5</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium">Players</span>
                    <span className="text-gray-300">1 Player</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Bottom Interactive Tabs Area */}
          <GameDetailsTabs config={config} relatedGames={relatedGames} />

        </div>
      </div>
    </>
  );
}
