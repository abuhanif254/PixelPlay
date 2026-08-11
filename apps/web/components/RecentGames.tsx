"use client";

import React from 'react';
import Link from 'next/link';
import { useRecentGames } from '@/hooks/useRecentGames';
import GameCard from '@/components/GameCard';
import { SectionHeader } from '@/components/SectionHeader';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import { gamesRegistry } from '@pixelplay/games/registry';

export default function RecentGames() {
  const { recentSlugs, isMounted } = useRecentGames();

  if (!isMounted) {
    // Avoid hydration mismatch by not rendering until mounted
    return null;
  }

  if (recentSlugs.length === 0) {
    // If no recent games, we might not want to render this section at all,
    // or we could render a default "Continue Playing" with a message.
    return null;
  }

  const recentGamesData = recentSlugs.map(slug => {
    const game = gamesRegistry[slug];
    if (!game) return null;
    return {
      slug,
      title: game.config.title,
      rating: game.config.rating || 4.5,
      image: game.config.image
    };
  }).filter(Boolean);

  return (
    <section aria-labelledby="continue-playing-heading">
      <div id="continue-playing-heading" className="sr-only">Continue Playing</div>
      <SectionHeader title="🎯 Continue Playing" actionText="Clear History" />
      <HorizontalScroll>
        {recentGamesData.map((game, i) => (
          <div key={`${game?.slug}-${i}`} className="min-w-[280px]">
            <Link href={`/games/${game?.slug}`} aria-label={`Play ${game?.title}`}>
              <GameCard title={game?.title!} rating={game?.rating!} imageUrl={game?.image} />
            </Link>
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
