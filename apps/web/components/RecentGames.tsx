"use client";

import React from 'react';
import Link from 'next/link';
import { useRecentGames } from '@/hooks/useRecentGames';
import GameCard from '@/components/GameCard';
import { SectionHeader } from '@/components/SectionHeader';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import { gamesRegistry } from '@spielcade/games/registry';

export default function RecentGames() {
  const { recentSlugs, clearRecentGames, isMounted } = useRecentGames();

  if (!isMounted) {
    // Avoid hydration mismatch by not rendering until mounted
    return null;
  }

  if (recentSlugs.length === 0) {
    return null;
  }

  const recentGamesData = recentSlugs.map(slug => {
    const game = gamesRegistry[slug];
    if (!game) return null;
    return {
      slug,
      title: game.config.title,
      rating: game.config.rating || 4.5,
      image: game.config.image,
      category: game.config.category || 'Arcade'
    };
  }).filter(Boolean);

  if (recentGamesData.length === 0) return null;

  return (
    <section aria-labelledby="continue-playing-heading">
      <div id="continue-playing-heading" className="sr-only">Continue Playing</div>
      <SectionHeader 
        title="🎯 Continue Playing" 
        actionText="Clear History"
        onActionClick={clearRecentGames}
      />
      <HorizontalScroll>
        {recentGamesData.map((game, i) => (
          <div key={`${game?.slug}-${i}`} className="w-64 flex-none shrink-0">
            <GameCard 
              title={game?.title!} 
              rating={game?.rating!} 
              imageUrl={game?.image} 
              slug={game?.slug}
              category={game?.category}
            />
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
