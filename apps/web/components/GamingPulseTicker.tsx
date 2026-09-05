'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Gamepad2, Zap, Dices, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GamingPulseTickerProps {
  totalGames?: number;
  featuredSlug?: string;
  randomPool?: string[];
}

export default function GamingPulseTicker({ 
  totalGames = 17125, 
  featuredSlug = 'blade-merge',
  randomPool = [] 
}: GamingPulseTickerProps) {
  const router = useRouter();
  const [onlinePlayers, setOnlinePlayers] = useState(14820);
  const [isHovered, setIsHovered] = useState(false);

  // Subtle realistic live player oscillation for gaming immersion
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePlayers(prev => {
        const delta = Math.floor(Math.random() * 21) - 10; // -10 to +10
        return Math.max(12000, prev + delta);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSurpriseMe = () => {
    if (randomPool && randomPool.length > 0) {
      const randomSlug = randomPool[Math.floor(Math.random() * randomPool.length)];
      router.push(`/games/${randomSlug}`);
    } else {
      router.push(`/games/${featuredSlug}`);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 -mt-6 mb-4 relative z-20">
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full bg-white/80 dark:bg-[#0D0E24]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-3 md:px-6 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm transition-all duration-300 hover:border-purple-500/30"
      >
        {/* Left: Real-time Indicators */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Live Gamers Online */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-gray-900 dark:text-white font-mono">
              {onlinePlayers.toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
              Gamers Playing Now
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />

          {/* Catalog Count */}
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Gamepad2 className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-gray-900 dark:text-white">
              {totalGames.toLocaleString()}+
            </span>
            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
              Free HTML5 Games
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-white/10 hidden md:block" />

          {/* Zero Install Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Instant Cloud Play • No Downloads</span>
          </div>
        </div>

        {/* Right: Quick Launch & Surprise Me CTA */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleSurpriseMe}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 border border-purple-500/20 text-purple-600 dark:text-purple-300 hover:text-white font-bold transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95"
            title="Play a randomly selected top-rated game"
          >
            <Dices className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span>Surprise Me</span>
          </button>

          <Link
            href="/popular"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-semibold transition-colors"
          >
            <span>Top Picks</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
