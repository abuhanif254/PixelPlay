"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRecentGames } from '@/hooks/useRecentGames';
import { RotateCcw, Play, Clock, Trophy, Trash2, Sparkles } from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function RecentGames() {
  const { recentGames, clearRecentGames, isMounted } = useRecentGames();
  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isMounted || recentGames.length === 0) return;
    try {
      const pbs: Record<string, number> = {};
      recentGames.forEach((g) => {
        const stored = localStorage.getItem(`spielcade_pb_${g.slug}`);
        if (stored) {
          pbs[g.slug] = Number(stored);
        }
      });
      setPersonalBests(pbs);
    } catch {}
  }, [isMounted, recentGames]);

  if (!isMounted || recentGames.length === 0) {
    return null;
  }

  const formatAgo = (isoString?: string) => {
    if (!isoString) return 'recently';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleClear = () => {
    arcadeAudio.playBlip();
    clearRecentGames();
  };

  return (
    <section aria-labelledby="continue-playing-heading" className="w-full relative">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/50 border border-purple-500/25 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
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
              <p className="text-xs md:text-sm text-gray-400">Jump right back into your recent games with zero setup</p>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-semibold transition-all"
            title="Clear Recent History"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>

        {/* Responsive Grid Shelf */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
          {recentGames.slice(0, 5).map((game) => {
            const pb = personalBests[game.slug];
            const imageSrc = game.image || `/icons/icon-192x192.png`;

            return (
              <div
                key={game.slug}
                className="group relative rounded-2xl bg-white/5 dark:bg-[#111227]/90 border border-white/10 hover:border-indigo-500/60 p-2.5 shadow-lg hover:shadow-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Thumbnail Container */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 mb-2.5 border border-white/5">
                  <img
                    src={imageSrc}
                    alt={game.title}
                    onError={(e) => {
                      e.currentTarget.src = '/icons/icon-192x192.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Relative time chip */}
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-bold text-gray-300 flex items-center gap-1">
                    <Clock size={10} className="text-amber-400" />
                    <span>{formatAgo(game.lastPlayed)}</span>
                  </div>

                  {/* PB badge if exists */}
                  {pb !== undefined && pb > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-md border border-indigo-400/40 text-[9px] font-black text-white flex items-center gap-1 shadow-sm">
                      <Trophy size={10} className="text-amber-300" />
                      <span>{pb.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Game Meta */}
                <div className="min-w-0 mb-3 px-1">
                  <h3 className="text-xs font-black font-outfit text-white truncate group-hover:text-indigo-400 transition-colors">
                    {game.title}
                  </h3>
                  {game.category && (
                    <span className="text-[10px] text-gray-400 font-medium truncate block">
                      {game.category}
                    </span>
                  )}
                </div>

                {/* Resume Button */}
                <Link
                  href={`/games/${game.slug}`}
                  onClick={() => arcadeAudio.playStart()}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Resume</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
