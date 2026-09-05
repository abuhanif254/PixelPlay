'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, Gamepad2, Users, Star, Play, X, ArrowRight, Dices, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';

// Dynamic import with ssr: false to decouple Three.js from initial critical bundle
const Hero3DController = dynamic(() => import('./Hero3DController'), {
  ssr: false,
  loading: () => <Hero3DFallback />
});

// Lightweight instant visual placeholder while 3D canvas compiles
function Hero3DFallback() {
  return (
    <div className="relative w-[120%] h-[120%] z-10 -mr-20 flex items-center justify-center pointer-events-none select-none">
      <div className="relative w-80 h-44 rounded-3xl bg-gradient-to-tr from-gray-200 via-gray-100 to-white dark:from-[#151632] dark:via-[#1a1b3a] dark:to-[#22244c] border border-gray-300 dark:border-white/10 shadow-[0_20px_50px_rgba(99,102,241,0.25)] flex items-center justify-between px-8 animate-pulse">
        {/* D-Pad */}
        <div className="w-14 h-14 relative flex items-center justify-center">
          <div className="w-14 h-5 bg-gray-400 dark:bg-gray-700 rounded-md" />
          <div className="w-5 h-14 bg-gray-400 dark:bg-gray-700 rounded-md absolute" />
        </div>
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm" />
          <div className="w-4 h-4 rounded-full bg-red-400 shadow-sm" />
          <div className="w-4 h-4 rounded-full bg-blue-400 shadow-sm" />
          <div className="w-4 h-4 rounded-full bg-green-400 shadow-sm" />
        </div>
      </div>
    </div>
  );
}

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
  liveSuggestions
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeFeatured = featuredGame || {
    title: 'Blade Merge',
    slug: 'blade-merge',
    category: 'Strategy',
    rating: 4.8,
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
    <section className="relative w-full min-h-[700px] pt-32 pb-16 bg-gray-50 dark:bg-[#0A0B1A] text-gray-900 dark:text-white overflow-hidden">
      
      {/* Star Particles Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-20 left-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_white]" />
        <div className="absolute top-40 left-[40%] w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_12px_2px_#93c5fd]" />
        <div className="absolute top-80 left-[5%] w-1 h-1 bg-white rounded-full shadow-[0_0_8px_1px_white]" />
        <div className="absolute top-32 right-[20%] w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_15px_3px_#fde047]" />
        <div className="absolute top-60 right-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_white]" />
        <div className="absolute bottom-20 right-[30%] w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_12px_2px_#c084fc]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Content (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Trust Badge */}
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full mb-6">
              <Zap className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-yellow-500 text-xs font-bold tracking-wide">
                100% Free • No Downloads • Instant HTML5 Play
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-[5.2rem] font-extrabold tracking-tight mb-6 leading-[1.08] text-balance font-outfit">
              Play Free <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899]">
                Browser Games
              </span> Online
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg lg:text-xl max-w-xl mb-8 leading-relaxed text-balance">
              Dive into {totalGamesCount ? `${totalGamesCount.toLocaleString()}+` : '17,000+'} high-speed HTML5 games. Play instantly on PC, tablet, or phone with zero installs.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
              <Link
                href={`/games/${activeFeatured.slug}`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Featured Game</span>
              </Link>

              <button
                onClick={handleSurpriseMe}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white dark:bg-[#13142B] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-bold text-sm sm:text-base hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-500/40 hover:text-purple-600 dark:hover:text-purple-300 transition-all hover:scale-105 active:scale-95"
                title="Launch a random top-rated game instantly"
              >
                <Dices className="w-4 h-4 text-purple-400" />
                <span>Surprise Me</span>
              </button>
              
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full text-gray-600 dark:text-gray-400 font-bold text-sm hover:text-purple-600 dark:hover:text-white transition-colors"
              >
                <span>Browse Genres</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Interactive Search Bar with Live Suggestions */}
            <div ref={searchContainerRef} className="w-full max-w-xl relative mb-5">
              <form 
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white dark:bg-[#13142B] border border-black/10 dark:border-white/10 rounded-full p-1.5 sm:p-2 focus-within:border-[#6366F1]/70 focus-within:ring-2 focus-within:ring-[#6366F1]/20 transition-all shadow-2xl z-20"
              >
                <div className="pl-3 sm:pl-4 pr-2">
                  <Search className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search 17,000+ games (e.g. Car, 2048, Snake)..." 
                  className="bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-full focus:outline-none text-sm sm:text-base py-2"
                  aria-label="Search free games"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button 
                  type="submit"
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold py-2.5 sm:py-3 px-5 sm:px-7 rounded-full transition-all duration-300 shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95 text-xs sm:text-sm"
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#13142B] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 sm:p-3 z-30 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/5 mb-1 flex items-center justify-between">
                      <span>{searchQuery.trim() ? 'Matching Games' : 'Trending Hits'}</span>
                      <span className="text-[10px] text-gray-500">Instant Launch</span>
                    </div>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((game) => {
                        const thumb = game.image_url || game.image;
                        return (
                          <Link
                            key={game.slug}
                            href={`/games/${game.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-purple-500/10 border border-purple-500/20 shrink-0 relative flex items-center justify-center text-purple-400">
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
                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#6366F1] transition-colors truncate">
                                  {game.title}
                                </p>
                                <span className="text-xs text-gray-400">{game.category || 'Arcade'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {game.rating && (
                                <div className="flex items-center text-yellow-500 text-xs font-bold">
                                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                  {game.rating.toFixed(1)}
                                </div>
                              )}
                              <Play className="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">
                        Press Enter to search for &quot;<span className="text-white font-bold">{searchQuery}</span>&quot;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Canonical Popular Searches (Direct Links to Cluster Hubs) */}
            <div className="flex flex-wrap items-center gap-2 mb-10">
              <span className="text-gray-500 text-xs sm:text-sm font-medium">Popular:</span>
              {[
                { label: 'Car Games', href: '/categories/car-games' },
                { label: 'Zombie Games', href: '/categories/zombie-games' },
                { label: '2 Player', href: '/categories/2-player-games' },
                { label: 'Action Games', href: '/categories/action-games' },
                { label: 'Puzzle Games', href: '/categories/puzzle-games' },
                { label: 'Unblocked Games', href: '/categories/unblocked-games' },
              ].map(tag => (
                <Link 
                  key={tag.label} 
                  href={tag.href}
                  className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {totalGamesCount ? `${totalGamesCount.toLocaleString()}+` : '17,000+'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Free Games</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">500K+</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Active Players</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Player Rating</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Controller on Desktop (5 cols) */}
          <div className="lg:col-span-5 relative w-full h-[520px] hidden lg:flex items-center justify-center">
            {/* Glowing Rings Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-[380px] h-[380px] rounded-full border border-purple-500/20 shadow-[0_0_100px_30px_rgba(139,92,246,0.15)] animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[500px] h-[500px] rounded-full border border-blue-500/10 shadow-[0_0_100px_30px_rgba(59,130,246,0.1)] animate-[spin_30s_linear_infinite_reverse]" />
            </div>
            
            {/* Interactive 3D Controller */}
            <Hero3DController />
          </div>

          {/* Mobile & Tablet Visual Card (when 3D is hidden) */}
          <div className="lg:hidden w-full flex justify-center mt-2">
            <Link 
              href={`/games/${activeFeatured.slug}`}
              className="group relative w-full max-w-sm rounded-2xl overflow-hidden bg-[#111228] border border-white/10 p-4 shadow-xl flex items-center gap-4 hover:border-purple-500/50 transition-all"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                {activeFeatured.image_url ? (
                  <Image
                    src={activeFeatured.image_url}
                    alt={activeFeatured.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-900 flex items-center justify-center text-white font-bold">
                    PLAY
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold mb-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{activeFeatured.rating || 4.8}</span>
                  <span className="text-gray-400">• Featured</span>
                </div>
                <h3 className="font-extrabold text-white text-base truncate group-hover:text-purple-400 transition-colors">
                  {activeFeatured.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">{activeFeatured.category || 'Arcade'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/40">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
