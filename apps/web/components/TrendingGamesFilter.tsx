"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import GameCard from '@/components/GameCard';

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

  // Extract unique categories from games
  const categories = ['All', ...Array.from(new Set(games.map(g => g.category)))];

  const filteredGames = activeCategory === 'All' 
    ? games 
    : games.filter(g => g.category === activeCategory);

  const visibleGames = filteredGames.slice(0, visibleCount);

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
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-4">
        {visibleGames.length > 0 ? (
          visibleGames.map((game, i) => (
            <Link href={`/games/${game.slug}`} key={`${game.slug}-${i}`} aria-label={`Play ${game.title}`}>
              <GameCard title={game.title} rating={game.rating} imageUrl={game.image} />
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No trending games found for this category.
          </div>
        )}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredGames.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="px-6 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Load More Games
          </button>
        </div>
      )}
    </div>
  );
}
