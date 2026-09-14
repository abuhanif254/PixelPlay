'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Dices, Flame, Play, Star, Trophy, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { scoreGamesWithAffinity, ScoredGame } from '@/lib/affinity-engine';
import { arcadeAudio } from '@/lib/arcade-audio';

interface ForYouFeedProps {
  initialGames: any[];
}

export default function ForYouFeed({ initialGames }: ForYouFeedProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'gems' | 'quick' | 'puzzle'>('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [surpriseGame, setSurpriseGame] = useState<ScoredGame | null>(null);

  // Compute personalized recommendations once on mount
  const scoredGames = useMemo(() => {
    return scoreGamesWithAffinity(initialGames);
  }, [initialGames]);

  const filteredGames = useMemo(() => {
    if (activeFilter === 'gems') {
      return scoredGames.filter((g) => g.badge?.includes('Gem') || (g.rating || 0) >= 4.8);
    }
    if (activeFilter === 'quick') {
      return scoredGames.filter((g) => g.category.toLowerCase().includes('arcade') || g.category.toLowerCase().includes('racing') || g.category.toLowerCase().includes('runner'));
    }
    if (activeFilter === 'puzzle') {
      return scoredGames.filter((g) => g.category.toLowerCase().includes('puzzle') || g.category.toLowerCase().includes('strategy') || g.category.toLowerCase().includes('board'));
    }
    return scoredGames;
  }, [scoredGames, activeFilter]);

  const handleSpinSurprise = () => {
    if (isSpinning || scoredGames.length === 0) return;
    setIsSpinning(true);
    arcadeAudio.playCountdownTick();

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const rand = scoredGames[Math.floor(Math.random() * scoredGames.length)];
      setSurpriseGame(rand);
      arcadeAudio.playBlip();

      if (counter >= 12) {
        clearInterval(interval);
        setIsSpinning(false);
        arcadeAudio.playLevelUp();
      }
    }, 100);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Recommendation Showcase */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-[#10122E] to-purple-950/60 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles size={13} className="text-yellow-400 animate-spin" />
              <span>Tailored To Your Play Style</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
              For You <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Discovery Engine</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Personalized algorithms analyzing your favorite genres, session depth, and high-score achievements to find your next favorite instant HTML5 game.
            </p>
          </div>

          {/* Spin the Reel Interactive Module */}
          <div className="flex flex-col items-center sm:items-end gap-3 w-full md:w-auto">
            <button
              onClick={handleSpinSurprise}
              disabled={isSpinning}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-black text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
            >
              <Dices size={18} className={isSpinning ? 'animate-spin' : ''} />
              <span>{isSpinning ? 'Selecting Game...' : '🎰 Spin Arcade Roulette'}</span>
            </button>

            {surpriseGame && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 border border-white/15 w-full sm:w-80 backdrop-blur-md"
              >
                <img
                  src={surpriseGame.image_url}
                  alt={surpriseGame.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-white truncate">{surpriseGame.title}</p>
                  <p className="text-[10px] text-amber-400 font-bold">{surpriseGame.badge}</p>
                </div>
                <Link
                  href={`/games/${surpriseGame.slug}`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shrink-0 transition-all hover:scale-105"
                >
                  Play
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: '🔥 Top Matches', icon: Flame },
          { id: 'gems', label: '💎 Hidden Gems', icon: Trophy },
          { id: 'quick', label: '⚡ 3-Min Thrills', icon: Sparkles },
          { id: 'puzzle', label: '🧠 Brain & Logic', icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                arcadeAudio.playBlip();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recommended Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredGames.slice(0, 24).map((game) => (
          <motion.div
            key={game.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col bg-[#0F1026] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
              <img
                src={game.image_url}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Match Badge Tag */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                <span>{game.badge || `🔥 ${game.matchPercent}% Match`}</span>
              </div>

              {/* Category Pill */}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                {game.category}
              </div>

              {/* Instant Hover Play Overlay */}
              <Link
                href={`/games/${game.slug}`}
                className="absolute inset-0 bg-indigo-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/50 group-hover:scale-110 transition-transform">
                  <Play size={20} className="fill-current ml-0.5" />
                </div>
              </Link>
            </div>

            {/* Content Body */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-black text-white truncate group-hover:text-indigo-400 transition-colors">
                    {game.title}
                  </h3>
                  <span className="text-amber-400 text-xs font-extrabold flex items-center gap-0.5 shrink-0">
                    ★ {Number(game.rating || 4.8).toFixed(1)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {game.affinityReason}
                </p>
              </div>

              {/* Bottom Play Trigger */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  {Number(game.total_plays || 12000).toLocaleString()} plays
                </span>
                <Link
                  href={`/games/${game.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group-hover:translate-x-0.5"
                >
                  <span>Play Now</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
