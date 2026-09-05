'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, Gamepad2, Users, Star, Play, X, ArrowRight, Dices, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import HeroGamingStage from './HeroGamingStage';

interface HeroGameItem {
  id?: string;
  slug: string;
  title: string;
  category?: string;
  rating?: number;
  image_url?: string;
  image?: string;
  total_plays?: number;
}

interface HeroSectionProps {
  totalGamesCount?: number;
  featuredGame?: HeroGameItem;
  randomPool?: string[];
  liveSuggestions?: HeroGameItem[];
  spotlightGames?: HeroGameItem[];
}

const DEFAULT_SUGGESTIONS: HeroGameItem[] = [
  { title: 'Blade Merge', category: 'Strategy', slug: 'blade-merge', rating: 4.8, image_url: 'https://img.gamemonetize.com/f8k0kn2o97v51uxbqkf0it3pvsbdw14s/512x384.jpg' },
  { title: 'Only Up Or Lava', category: 'Adventure', slug: 'only-up-or-lava', rating: 4.7, image_url: 'https://img.gamemonetize.com/cd2qifsgo6o682uu8vufmuxw7hk851gi/512x384.jpg' },
  { title: 'Catchy Ball', category: 'Sports', slug: 'catchy-ball', rating: 4.7, image_url: 'https://img.gamemonetize.com/ixwhz13h3za57hm3ke5g6abpm2aanxth/512x384.jpg' },
  { title: 'Neon Flyer', category: 'Arcade', slug: 'flappy-bird', rating: 4.9 },
  { title: '2048 Online', category: 'Puzzle', slug: '2048', rating: 4.9 },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  totalGamesCount,
  featuredGame,
  randomPool = [],
  liveSuggestions,
  spotlightGames
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeFeatured = featuredGame || {
    title: 'Blade Merge',
    slug: 'blade-merge',
    category: 'Strategy',
    rating: 4.9,
    image_url: 'https://img.gamemonetize.com/f8k0kn2o97v51uxbqkf0it3pvsbdw14s/512x384.jpg'
  };

  const suggestions = liveSuggestions && liveSuggestions.length > 0 ? liveSuggestions : DEFAULT_SUGGESTIONS;

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSurpriseMe = () => {
    if (randomPool.length > 0) {
      const randomSlug = randomPool[Math.floor(Math.random() * randomPool.length)];
      router.push(`/games/${randomSlug}`);
    } else {
      router.push(`/games/${activeFeatured.slug}`);
    }
  };

  const filteredSuggestions = searchQuery.trim()
    ? suggestions.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : suggestions.slice(0, 5);

  return (
    <section className="relative w-full pt-28 sm:pt-32 pb-12 sm:pb-16 bg-white dark:bg-[#0A0B1A] text-slate-900 dark:text-white overflow-hidden">
      
      {/* Background Ambient Glows & Subtle Patterns */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-20 left-[5%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-[30%] w-80 h-80 bg-pink-500/10 rounded-full blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Core Value Proposition & Search (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 dark:border-amber-500/20 px-3.5 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span className="text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide">
                100% Free • No Downloads • Instant HTML5 Play
              </span>
            </div>

            {/* Main Headline with High-Contrast Gradient */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.85rem] font-black tracking-tight mb-5 leading-[1.08] text-slate-900 dark:text-white font-outfit">
              Play Free <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Browser Games
              </span> Online
            </h1>

            {/* Sub-headline */}
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl mb-7 leading-relaxed font-normal">
              Dive into {totalGamesCount ? `${totalGamesCount.toLocaleString()}+` : '17,000+'} high-speed HTML5 games. Play instantly on PC, tablet, or phone with zero installs.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-7">
              <Link
                href={`/games/${activeFeatured.slug}`}
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_28px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Featured Game</span>
              </Link>

              <button
                onClick={handleSurpriseMe}
                className="inline-flex items-center gap-2 px-5 py-3 sm:py-3.5 rounded-full bg-white dark:bg-[#13142B] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-300 shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                title="Launch a random top-rated game instantly"
              >
                <Dices className="w-4 h-4 text-purple-500" />
                <span>Surprise Me</span>
              </button>
              
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-slate-600 dark:text-slate-400 font-bold text-xs sm:text-sm hover:text-purple-600 dark:hover:text-white transition-colors"
              >
                <span>Browse 25+ Genres</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Search Bar with Live Suggestions Dropdown */}
            <div ref={searchContainerRef} className="w-full max-w-lg relative mb-4">
              <form 
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white dark:bg-[#13142B] border border-slate-300 dark:border-white/10 rounded-full p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg z-20"
              >
                <div className="pl-3.5 pr-2">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search 17,000+ games (e.g. Car, 2048, Snake)..." 
                  className="bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 w-full focus:outline-none text-xs sm:text-sm py-2"
                  aria-label="Search free games"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white mr-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 sm:py-2.5 px-5 sm:px-6 rounded-full transition-all duration-300 shrink-0 shadow-md hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 text-xs font-semibold"
                >
                  Search
                </button>
              </form>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#13142B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 sm:p-3 z-30 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
                      <span>{searchQuery.trim() ? 'Matching Games' : 'Trending Hits'}</span>
                      <span className="text-[10px] text-slate-400">Instant Launch</span>
                    </div>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((game) => {
                        const thumb = game.image_url || game.image;
                        return (
                          <Link
                            key={game.slug}
                            href={`/games/${game.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-purple-500/10 border border-purple-500/20 shrink-0 relative flex items-center justify-center text-purple-500">
                                {thumb ? (
                                  <Image
                                    src={thumb}
                                    alt={game.title}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <Gamepad2 className="w-5 h-5" />
                                )}
                              </div>
                              <div className="truncate">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                  {game.title}
                                </p>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">{game.category || 'Arcade'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {game.rating && (
                                <div className="flex items-center text-amber-500 text-xs font-bold">
                                  <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                                  {game.rating.toFixed(1)}
                                </div>
                              )}
                              <Play className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs sm:text-sm text-slate-500">
                        Press Enter to search for &quot;<span className="text-slate-900 dark:text-white font-bold">{searchQuery}</span>&quot;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Popular Searches Canonical Cluster Hubs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-slate-500 text-xs font-medium">Popular:</span>
              {[
                { label: 'Car Games', href: '/categories/car-games' },
                { label: 'Zombie Games', href: '/categories/zombie-games' },
                { label: '2 Player', href: '/categories/2-player-games' },
                { label: 'Action Games', href: '/categories/action-games' },
                { label: 'Puzzle Games', href: '/categories/puzzle-games' },
                { label: 'Unblocked', href: '/categories/unblocked-games' },
              ].map(tag => (
                <Link 
                  key={tag.label} 
                  href={tag.href}
                  className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-purple-500/40 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-2 border-t border-slate-100 dark:border-white/5 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Gamepad2 className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {totalGamesCount ? `${totalGamesCount.toLocaleString()}+` : '17,000+'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Free Games</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Users className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">500K+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Players</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">4.9/5</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Player Rating</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Holographic Cyber Gaming Stage (5 cols on desktop) */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center mt-6 lg:mt-0">
            <HeroGamingStage games={spotlightGames} />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
