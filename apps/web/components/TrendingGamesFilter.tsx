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

  // Extract unique categories from games
  const categories = ['All', ...Array.from(new Set(games.map(g => g.category)))];

  const filteredGames = activeCategory === 'All' 
    ? games 
    : games.filter(g => g.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Tag Cloud */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game, i) => (
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
    </div>
  );
}
