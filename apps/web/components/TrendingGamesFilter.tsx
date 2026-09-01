"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import GameCardSkeleton from '@/components/GameCardSkeleton';
import { useInView } from 'react-intersection-observer';

interface GameItem {
  id?: string;
  slug?: string;
  title: string;
  rating?: number;
  category?: string;
  image?: string;
}

interface TrendingGamesFilterProps {
  games: GameItem[];
}

export function TrendingGamesFilter({ games }: TrendingGamesFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Extract unique categories from games
  const categories = ['All', ...Array.from(new Set(games.map(g => g.category).filter(Boolean) as string[]))];

  const filteredGames = activeCategory === 'All' 
    ? games 
    : games.filter(g => g.category === activeCategory);

  const visibleGames = filteredGames.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGames.length;

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setIsLoading(true);
      // Simulate network request for skeletons to show
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 12);
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [inView, hasMore, isLoading]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(12); // Reset on category change
  };

  // Compute category counts
  const categoryCounts = games.reduce((acc, g) => {
    const cat = g.category || 'Arcade';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Category Tag Cloud */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          const count = cat === 'All' ? games.length : (categoryCounts[cat] || 0);

          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105' 
                  : 'bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-purple-500/40 hover:text-gray-900 dark:hover:text-white shadow-sm'
              }`}
              aria-pressed={isSelected}
            >
              <span>{cat === 'All' ? '🔥 All Trending' : cat}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:bg-purple-500/10 group-hover:text-purple-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-4">
        {visibleGames.length > 0 ? (
          visibleGames.map((game, i) => {
            const uniqueId = game.slug || game.id || String(i);
            return (
              <div key={uniqueId} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded-2xl block">
                <GameCard title={game.title} rating={game.rating || 5.0} imageUrl={game.image} category={game.category || 'Arcade'} slug={uniqueId} />
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No trending games found for this category.
          </div>
        )}
        
        {/* Loading Skeletons */}
        {isLoading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <GameCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={ref} className="h-10 w-full flex items-center justify-center">
          {!isLoading && <span className="sr-only">Scroll for more</span>}
        </div>
      )}
    </div>
  );
}
