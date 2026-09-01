'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, Gamepad2, Users, Star, Play, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
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

// Popular suggested games for instant search autocomplete
const POPULAR_SUGGESTIONS = [
  { title: 'Neon Flyer', category: 'Arcade', slug: 'flappy-bird', rating: 4.9 },
  { title: '2048', category: 'Puzzle', slug: '2048', rating: 4.9 },
  { title: 'Neon Snake', category: 'Arcade', slug: 'snake', rating: 4.8 },
];

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  const filteredSuggestions = searchQuery.trim()
    ? POPULAR_SUGGESTIONS.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_SUGGESTIONS;

  return (
    <section className="relative w-full min-h-[700px] pt-32 pb-20 bg-gray-50 dark:bg-[#0A0B1A] text-gray-900 dark:text-white overflow-hidden">
      
      {/* Star Particles Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
        <div className="absolute top-20 left-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_white]" />
        <div className="absolute top-40 left-[40%] w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_12px_2px_#93c5fd]" />
        <div className="absolute top-80 left-[5%] w-1 h-1 bg-white rounded-full shadow-[0_0_8px_1px_white]" />
        <div className="absolute top-32 right-[20%] w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_15px_3px_#fde047]" />
        <div className="absolute top-60 right-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_white]" />
        <div className="absolute bottom-20 right-[30%] w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_12px_2px_#c084fc]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-start">
            
            {/* Trust Badge */}
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full mb-8">
              <Zap className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-yellow-500 text-xs font-bold tracking-wide">
                100% Free • No Downloads • Instant Play
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight mb-6 leading-[1.05] text-balance font-outfit">
              Play Amazing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">Games</span> Online
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl lg:text-2xl max-w-lg mb-8 leading-relaxed text-balance">
              Discover thousands of free browser games. No downloads, no installs – just click and play instantly!
            </p>

            {/* Call to Actions: Quick Play & Featured */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link
                href="/games/flappy-bird"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white font-bold text-base shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                Play Featured Game
              </Link>
              
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white dark:bg-[#13142B] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-bold text-base hover:bg-gray-100 dark:hover:bg-white/5 hover:border-purple-500/40 transition-all"
              >
                Explore Genres
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </Link>
            </div>

            {/* Interactive Search Bar with Live Suggestions */}
            <div ref={searchContainerRef} className="w-full max-w-xl relative mb-6">
              <form 
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white dark:bg-[#13142B] border border-black/10 dark:border-white/10 rounded-full p-2 focus-within:border-[#6366F1]/70 focus-within:ring-2 focus-within:ring-[#6366F1]/20 transition-all shadow-2xl z-20"
              >
                <div className="pl-4 pr-2">
                  <Search className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search games (e.g. 2048, Snake, Flyer)..." 
                  className="bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-full focus:outline-none text-base md:text-lg py-2.5"
                  aria-label="Search free games"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button 
                  type="submit"
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95 text-sm md:text-base"
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#13142B] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 z-30 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/5 mb-1 flex items-center justify-between">
                      <span>{searchQuery.trim() ? 'Matching Games' : 'Trending Now'}</span>
                      <span className="text-[10px] text-gray-500">Instant Launch</span>
                    </div>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((game) => (
                        <Link
                          key={game.slug}
                          href={`/games/${game.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                              <Gamepad2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#6366F1] transition-colors">{game.title}</p>
                              <span className="text-xs text-gray-400">{game.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-yellow-500 text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-current mr-1" />
                              {game.rating}
                            </div>
                            <Play className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">
                        Press Enter to search for &quot;<span className="text-white font-bold">{searchQuery}</span>&quot;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Popular Searches Direct Links (Zero Redirect Hops) */}
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <span className="text-gray-500 text-sm font-medium">Popular:</span>
              {[
                { label: 'Snake', query: 'snake' },
                { label: '2048', query: '2048' },
                { label: 'Neon Flyer', query: 'neon flyer' },
                { label: 'Puzzle', query: 'puzzle' },
                { label: 'Arcade', query: 'arcade' }
              ].map(tag => (
                <Link 
                  key={tag.label} 
                  href={`/games?search=${encodeURIComponent(tag.query)}`}
                  className="px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Gamepad2 className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">1000+</div>
                  <div className="text-sm text-gray-500 font-medium">Free Games</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">500K+</div>
                  <div className="text-sm text-gray-500 font-medium">Active Players</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                  <div className="text-sm text-gray-500 font-medium">Player Rating</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Visuals */}
          <div className="relative w-full h-[600px] hidden lg:flex items-center justify-center">
            {/* Glowing Rings Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-[400px] h-[400px] rounded-full border border-purple-500/20 shadow-[0_0_100px_30px_rgba(139,92,246,0.15)] animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[550px] h-[550px] rounded-full border border-blue-500/10 shadow-[0_0_100px_30px_rgba(59,130,246,0.1)] animate-[spin_30s_linear_infinite_reverse]" />
            </div>
            
            {/* Interactive 3D Controller */}
            <Hero3DController />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
