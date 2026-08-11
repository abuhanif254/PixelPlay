"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import GameCardSkeleton from '@/components/GameCardSkeleton';
import { useInView } from 'react-intersection-observer';

interface GameItem {
  slug: string;
  title: string;
  rating: number;
  category: string;
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
  const categories = ['All', ...Array.from(new Set(games.map(g => g.category)))];

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

  return (
    <div className="space-y-6">
      {/* Category Tag Cloud */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeCategory === cat 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-4">
        {visibleGames.length > 0 ? (
          visibleGames.map((game, i) => (
            <div key={`${game.slug}-${i}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded-2xl block">
              <GameCard title={game.title} rating={game.rating} imageUrl={game.image} category={game.category} slug={game.slug} />
            </div>
          ))
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
