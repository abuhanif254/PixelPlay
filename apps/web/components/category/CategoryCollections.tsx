import React from 'react';
import Link from 'next/link';

interface CategoryCollectionsProps {
  currentSlug?: string;
}

interface CollectionItem {
  title: string;
  slug: string;
  games: string;
  icon: string;
  color: string;
}

const CATEGORY_COLLECTIONS_MAP: Record<string, CollectionItem[]> = {
  'racing-games': [
    { title: 'Car Games', slug: 'car-games', games: '1,000+', icon: '🚗', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Drift Games', slug: 'drift-games', games: '110+', icon: '🏎️', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Moto Games', slug: 'moto-games', games: '125+', icon: '🏍️', color: 'bg-orange-500/10 border-orange-500/30' },
    { title: '2 Player Games', slug: '2-player-games', games: '130+', icon: '👥', color: 'bg-pink-500/10 border-pink-500/30' },
  ],
  'car-games': [
    { title: 'Drift Games', slug: 'drift-games', games: '110+', icon: '🏎️', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Police Car Games', slug: 'police-car-games', games: '75+', icon: '🚓', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Truck Games', slug: 'truck-games', games: '90+', icon: '🚚', color: 'bg-amber-500/10 border-amber-500/30' },
    { title: 'Racing Games', slug: 'racing-games', games: '1,600+', icon: '🏁', color: 'bg-emerald-500/10 border-emerald-500/30' },
  ],
  'action-games': [
    { title: 'Shooting Games', slug: 'shooting-games', games: '580+', icon: '🎯', color: 'bg-red-500/10 border-red-500/30' },
    { title: 'Zombie Games', slug: 'zombie-games', games: '330+', icon: '🧟', color: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Stickman Games', slug: 'stickman-games', games: '230+', icon: '🏃', color: 'bg-indigo-500/10 border-indigo-500/30' },
    { title: 'Ninja Games', slug: 'ninja-games', games: '85+', icon: '🥷', color: 'bg-slate-500/10 border-slate-500/30' },
  ],
  'shooting-games': [
    { title: 'FPS Games', slug: 'fps-games', games: '140+', icon: '🔫', color: 'bg-red-500/10 border-red-500/30' },
    { title: 'Sniper Games', slug: 'sniper-games', games: '80+', icon: '🔭', color: 'bg-teal-500/10 border-teal-500/30' },
    { title: 'Tank Games', slug: 'tank-games', games: '110+', icon: '🛡️', color: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Action Games', slug: 'action-games', games: '3,200+', icon: '⚔️', color: 'bg-orange-500/10 border-orange-500/30' },
  ],
  'zombie-games': [
    { title: 'Shooting Games', slug: 'shooting-games', games: '580+', icon: '🎯', color: 'bg-red-500/10 border-red-500/30' },
    { title: 'Horror Games', slug: 'horror-games', games: '95+', icon: '👻', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Survival Games', slug: 'action-games', games: '3,200+', icon: '🪓', color: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Stickman Games', slug: 'stickman-games', games: '230+', icon: '🏃', color: 'bg-indigo-500/10 border-indigo-500/30' },
  ],
  'puzzle-games': [
    { title: 'Escape Games', slug: 'escape-games', games: '530+', icon: '🗝️', color: 'bg-amber-500/10 border-amber-500/30' },
    { title: 'Brain Games', slug: 'brain-games', games: '300+', icon: '🧠', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Mahjong Games', slug: 'mahjong-games', games: '50+', icon: '🀄', color: 'bg-teal-500/10 border-teal-500/30' },
    { title: 'Solitaire Games', slug: 'solitaire-games', games: '60+', icon: '🃏', color: 'bg-indigo-500/10 border-indigo-500/30' },
  ],
  'sports-games': [
    { title: 'Football Games', slug: 'football-games', games: '120+', icon: '⚽', color: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Basketball Games', slug: 'basketball-games', games: '100+', icon: '🏀', color: 'bg-orange-500/10 border-orange-500/30' },
    { title: 'Pool Games', slug: 'pool-games', games: '65+', icon: '🎱', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Cricket Games', slug: 'cricket-games', games: '45+', icon: '🏏', color: 'bg-amber-500/10 border-amber-500/30' },
  ],
  'arcade-games': [
    { title: 'Runner Games', slug: 'runner-games', games: '670+', icon: '🏃‍♂️', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Dress Up Games', slug: 'dress-up-games', games: '350+', icon: '👗', color: 'bg-pink-500/10 border-pink-500/30' },
    { title: 'Cooking Games', slug: 'cooking-games', games: '120+', icon: '🍳', color: 'bg-amber-500/10 border-amber-500/30' },
    { title: 'Retro Arcade Games', slug: 'retro-arcade-games', games: '150+', icon: '🕹️', color: 'bg-purple-500/10 border-purple-500/30' },
  ],
  'strategy-games': [
    { title: 'Tower Defense Games', slug: 'tower-defense-games', games: '85+', icon: '🏰', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'War Games', slug: 'war-games', games: '110+', icon: '⚔️', color: 'bg-red-500/10 border-red-500/30' },
    { title: 'Chess Games', slug: 'chess-games', games: '40+', icon: '♟️', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Board Games', slug: 'board-games', games: '520+', icon: '🎲', color: 'bg-emerald-500/10 border-emerald-500/30' },
  ],
  'board-games': [
    { title: 'Chess Games', slug: 'chess-games', games: '40+', icon: '♟️', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Solitaire Games', slug: 'solitaire-games', games: '60+', icon: '🃏', color: 'bg-indigo-500/10 border-indigo-500/30' },
    { title: 'Mahjong Games', slug: 'mahjong-games', games: '50+', icon: '🀄', color: 'bg-teal-500/10 border-teal-500/30' },
    { title: 'Puzzle Games', slug: 'puzzle-games', games: '3,450+', icon: '🧩', color: 'bg-blue-500/10 border-blue-500/30' },
  ],
  'adventure-games': [
    { title: 'Escape Games', slug: 'escape-games', games: '530+', icon: '🗝️', color: 'bg-amber-500/10 border-amber-500/30' },
    { title: 'Horror Games', slug: 'horror-games', games: '95+', icon: '👻', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Ninja Games', slug: 'ninja-games', games: '85+', icon: '🥷', color: 'bg-slate-500/10 border-slate-500/30' },
    { title: 'Action Games', slug: 'action-games', games: '3,200+', icon: '⚔️', color: 'bg-emerald-500/10 border-emerald-500/30' },
  ],
  'unblocked-games': [
    { title: 'Chromebook Games', slug: 'chromebook-games', games: '12K+', icon: '💻', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Games for School', slug: 'games-for-school', games: '15K+', icon: '🎒', color: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'No Download Games', slug: 'no-download-games', games: '17K+', icon: '⚡', color: 'bg-amber-500/10 border-amber-500/30' },
    { title: '2 Player Games', slug: '2-player-games', games: '130+', icon: '👥', color: 'bg-pink-500/10 border-pink-500/30' },
  ],
  '2-player-games': [
    { title: '3 Player Games', slug: '3-player-games', games: '35+', icon: '🎮', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: '4 Player Games', slug: '4-player-games', games: '25+', icon: '🕹️', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Sports Games', slug: 'sports-games', games: '1,050+', icon: '⚽', color: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Car Games', slug: 'car-games', games: '1,000+', icon: '🚗', color: 'bg-orange-500/10 border-orange-500/30' },
  ],
  'runner-games': [
    { title: 'Parkour Games', slug: 'parkour-games', games: '75+', icon: '🤸', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Stickman Games', slug: 'stickman-games', games: '230+', icon: '🏃', color: 'bg-indigo-500/10 border-indigo-500/30' },
    { title: 'Arcade Games', slug: 'arcade-games', games: '4,100+', icon: '👾', color: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Action Games', slug: 'action-games', games: '3,200+', icon: '⚔️', color: 'bg-emerald-500/10 border-emerald-500/30' },
  ],
  'io-games': [
    { title: '2 Player Games', slug: '2-player-games', games: '130+', icon: '👥', color: 'bg-pink-500/10 border-pink-500/30' },
    { title: 'Action Games', slug: 'action-games', games: '3,200+', icon: '⚔️', color: 'bg-red-500/10 border-red-500/30' },
    { title: 'Shooting Games', slug: 'shooting-games', games: '580+', icon: '🎯', color: 'bg-amber-500/10 border-amber-500/30' },
    { title: 'Multiplayer Games', slug: 'multiplayer-games', games: '250+', icon: '🌐', color: 'bg-blue-500/10 border-blue-500/30' },
  ],
};

const DEFAULT_COLLECTIONS: CollectionItem[] = [
  { title: 'Car Games', slug: 'car-games', games: '1,000+', icon: '🚗', color: 'bg-blue-500/10 border-blue-500/30' },
  { title: 'Zombie Games', slug: 'zombie-games', games: '330+', icon: '🧟', color: 'bg-emerald-500/10 border-emerald-500/30' },
  { title: '2 Player Games', slug: '2-player-games', games: '130+', icon: '👥', color: 'bg-pink-500/10 border-pink-500/30' },
  { title: 'Unblocked Games', slug: 'unblocked-games', games: '17K+', icon: '🔓', color: 'bg-indigo-500/10 border-indigo-500/30' },
];

export default function CategoryCollections({ currentSlug }: CategoryCollectionsProps) {
  const collections = (currentSlug && CATEGORY_COLLECTIONS_MAP[currentSlug]) || DEFAULT_COLLECTIONS;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🌟</span>
        <h3 className="font-bold text-gray-900 dark:text-white text-base">Popular Related Collections</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {collections.map((item) => (
          <Link
            key={item.slug}
            href={`/categories/${item.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-200 group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {item.title}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.games} Playable</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
