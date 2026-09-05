'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from '@/components/GameCard';
import { Flame, ArrowRight, Trophy } from 'lucide-react';

interface GameItem {
  id?: string;
  slug?: string;
  title: string;
  rating?: number;
  category?: string;
  image?: string;
  image_url?: string;
  total_plays?: number;
}

interface TrendingGamesFilterProps {
  games: GameItem[];
}

interface FilterTab {
  id: string;
  label: string;
  icon: string;
  matches: (category: string, title: string) => boolean;
}

const FILTER_TABS: FilterTab[] = [
  { id: 'all', label: 'All Trending', icon: '🔥', matches: () => true },
  { 
    id: 'action', 
    label: 'Action', 
    icon: '⚡', 
    matches: (cat, t) => /action|combat|fight/i.test(cat) || /action|fight|war/i.test(t) 
  },
  { 
    id: 'racing', 
    label: 'Racing & Cars', 
    icon: '🏎️', 
    matches: (cat, t) => /racing|car|moto|drift/i.test(cat) || /car|racing|drift|moto|speed/i.test(t) 
  },
  { 
    id: 'puzzle', 
    label: 'Puzzle & Logic', 
    icon: '🧩', 
    matches: (cat, t) => /puzzle|board|brain|math/i.test(cat) || /puzzle|2048|merge|match|mahjong/i.test(t) 
  },
  { 
    id: 'arcade', 
    label: 'Arcade', 
    icon: '👾', 
    matches: (cat, t) => /arcade|retro|classic/i.test(cat) || /runner|ninja|ball|jump/i.test(t) 
  },
  { 
    id: 'strategy', 
    label: 'Strategy', 
    icon: '♟️', 
    matches: (cat, t) => /strategy|tower|defense/i.test(cat) || /merge|defense|build/i.test(t) 
  },
];

export function TrendingGamesFilter({ games }: TrendingGamesFilterProps) {
  const [activeTabId, setActiveTabId] = useState<string>('all');

  const currentTab = FILTER_TABS.find(t => t.id === activeTabId) || FILTER_TABS[0];

  const filteredGames = activeTabId === 'all'
    ? games
    : games.filter(g => currentTab.matches(g.category || '', g.title || ''));

  // Ensure at least a fallback subset if filter yields fewer than 4 items
  const displayGames = filteredGames.length >= 4 
    ? filteredGames 
    : (filteredGames.length > 0 ? filteredGames : games.slice(0, 12));

  return (
    <div className="space-y-6">
      {/* Category Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {FILTER_TABS.map((tab) => {
          const isSelected = activeTabId === tab.id;
          const matchingCount = tab.id === 'all' 
            ? games.length 
            : games.filter(g => tab.matches(g.category || '', g.title || '')).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105' 
                  : 'bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-purple-500/40 hover:text-gray-900 dark:hover:text-white shadow-sm'
              }`}
              aria-pressed={isSelected}
            >
              <span>{tab.icon} {tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:bg-purple-500/10 group-hover:text-purple-400'
              }`}>
                {matchingCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Animated Game Cards Grid */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5"
      >
        <AnimatePresence mode="popLayout">
          {displayGames.map((game, index) => {
            const uniqueId = game.slug || game.id || String(index);
            const playsCount = game.total_plays || 10000;
            const playsStr = `${Math.floor(playsCount / 1000)}K plays`;
            const img = game.image || game.image_url;

            return (
              <motion.div
                key={uniqueId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
                className="h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded-2xl block"
              >
                <GameCard 
                  title={game.title} 
                  rating={game.rating || 4.8} 
                  imageUrl={img} 
                  category={game.category || 'Arcade'} 
                  slug={uniqueId}
                  plays={playsStr}
                  rank={activeTabId === 'all' && index < 3 ? index + 1 : undefined}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* View All Action */}
      <div className="flex justify-center pt-4">
        <Link
          href="/popular"
          className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 hover:border-purple-500 text-gray-800 dark:text-white font-bold text-sm rounded-full shadow-md hover:shadow-[0_0_25px_rgba(147,51,234,0.3)] transition-all hover:scale-105"
        >
          <span>Explore All 100+ Trending Games</span>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
