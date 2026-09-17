'use client';

import React from 'react';
import MobileAppIconCard from './MobileAppIconCard';
import { MobileGameItem, MobileBadgeType } from './types';

interface MobileAppGridProps {
  games: MobileGameItem[];
  priorityFirstRow?: boolean;
}

export default function MobileAppGrid({
  games,
  priorityFirstRow = false,
}: MobileAppGridProps) {
  if (!games || games.length === 0) return null;

  // Determine badge distribution pattern resembling CrazyGames / Poki
  const getBadgeForIndex = (index: number, game: MobileGameItem): MobileBadgeType => {
    // If game has high rating or rank
    if (game.rating && game.rating >= 4.9 && index % 3 === 0) return 'star';
    if (index % 4 === 1) return 'video';
    if (index % 5 === 0) return 'refresh';
    if (index % 7 === 2) return 'flame';
    return 'none';
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-1.5">
      {games.map((game, idx) => (
        <MobileAppIconCard
          key={game.slug || game.id || idx}
          game={game}
          priority={priorityFirstRow && idx < 3}
          badge={getBadgeForIndex(idx, game)}
        />
      ))}
    </div>
  );
}
