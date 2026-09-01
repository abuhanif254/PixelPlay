"use client";

import React from 'react';
import Link from 'next/link';
import { useRecentGames } from '@/hooks/useRecentGames';
import GameCard from '@/components/GameCard';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import { Play, RotateCcw, Trash2, Sparkles } from 'lucide-react';

export default function RecentGames() {
  const { recentGames, clearRecentGames, isMounted } = useRecentGames();

  if (!isMounted || recentGames.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="continue-playing-heading" className="w-full relative">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-black/40 border border-purple-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <RotateCcw className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="continue-playing-heading" className="text-xl md:text-2xl font-extrabold font-outfit text-white tracking-tight">
                  Continue Playing
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 border border-green-500/30 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  Ready
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-400">Jump right back into your recent games</p>
            </div>
          </div>

          <button
            onClick={clearRecentGames}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-semibold transition-all"
            title="Clear Recent History"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>

        {/* Horizontal Game Shelf */}
        <HorizontalScroll>
          {recentGames.map((game, i) => (
            <div key={`${game.slug}-${i}`} className="w-64 flex-none shrink-0 relative group">
              <GameCard 
                title={game.title} 
                rating={game.rating || 4.8} 
                imageUrl={game.image} 
                slug={game.slug}
                category={game.category || 'Arcade'}
                plays="Resume"
              />
            </div>
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
}
