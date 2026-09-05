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
  'action-games': [
    { title: 'Shooting Games', slug: 'shooting-games', games: '580+', icon: '🎯', color: 'bg-red-500/10 border-red-500/30' },
    { title: 'Zombie Games', slug: 'zombie-games', games: '330+', icon: '🧟', color: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Stickman Games', slug: 'stickman-games', games: '230+', icon: '🏃', color: 'bg-indigo-500/10 border-indigo-500/30' },
    { title: 'Ninja Games', slug: 'ninja-games', games: '85+', icon: '🥷', color: 'bg-slate-500/10 border-slate-500/30' },
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
    { title: '2 Player Games', slug: '2-player-games', games: '130+', icon: '👥', color: 'bg-pink-500/10 border-pink-500/30' },
    { title: 'Car Games', slug: 'car-games', games: '1,000+', icon: '🚗', color: 'bg-blue-500/10 border-blue-500/30' },
  ],
  'arcade-games': [
    { title: 'Runner Games', slug: 'runner-games', games: '670+', icon: '🏃‍♂️', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Dress Up Games', slug: 'dress-up-games', games: '350+', icon: '👗', color: 'bg-pink-500/10 border-pink-500/30' },
    { title: 'Cooking Games', slug: 'cooking-games', games: '120+', icon: '🍳', color: 'bg-amber-500/10 border-amber-500/30' },
    { title: 'Unblocked Games', slug: 'unblocked-games', games: '17K+', icon: '🔓', color: 'bg-emerald-500/10 border-emerald-500/30' },
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Trending Game Collections</h3>
        <Link href="/categories" className="text-xs font-bold text-[#6366F1] hover:text-[#5457DF] transition-colors">
          View All Genres
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collections.map((collection, index) => (
          <Link 
            key={index} 
            href={`/categories/${collection.slug}`} 
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border bg-transparent hover:bg-white dark:hover:bg-white/5 transition-all duration-300 group cursor-pointer ${collection.color}`}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {collection.icon}
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-300 text-center mb-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {collection.title}
            </h4>
            <span className="text-xs text-gray-600 dark:text-gray-500 font-medium">{collection.games} Games</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
