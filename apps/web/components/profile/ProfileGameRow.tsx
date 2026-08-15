'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toggleFavoriteGame } from '@/app/profile/actions';

interface Game {
  id?: string;
  title: string;
  slug?: string;
  image: string;
  meta?: string;
  rating?: string;
  isFavorite?: boolean;
}

interface ProfileGameRowProps {
  title: string;
  games: Game[];
  viewAllLink: string;
  favoriteIds?: string[];
  showToggle?: boolean;
}

export default function ProfileGameRow({ title, games, viewAllLink, favoriteIds = [], showToggle = false }: ProfileGameRowProps) {
  const [localFavs, setLocalFavs] = useState<Set<string>>(new Set(favoriteIds));
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (gameId: string) => {
    if (!gameId || toggling) return;
    setToggling(gameId);
    const isFav = localFavs.has(gameId);
    setLocalFavs(prev => {
      const next = new Set(prev);
      isFav ? next.delete(gameId) : next.add(gameId);
      return next;
    });
    await toggleFavoriteGame(gameId);
    setToggling(null);
  };

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col shadow-sm h-full">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-[#6366F1] text-xs font-bold hover:underline transition-colors">
              View All
            </Link>
          )}
        </div>
      )}

      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <span className="text-3xl">{title === 'Favorite Games' ? '💜' : '🎮'}</span>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title === 'Favorite Games' ? 'No favorites yet' : 'No games played yet'}
          </p>
          <Link href="/games" className="text-xs text-[#6366F1] font-bold hover:underline">
            Browse games →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {games.map((game, i) => {
            const isFav = game.id ? localFavs.has(game.id) : false;
            return (
              <motion.div
                key={game.id || i}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex flex-col group relative"
              >
                <Link href={game.slug ? `/games/${game.slug}` : '#'} className="block">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-gray-100 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/5">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Favorite toggle */}
                    {showToggle && game.id && (
                      <button
                        onClick={e => { e.preventDefault(); handleToggle(game.id!); }}
                        disabled={toggling === game.id}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
                      >
                        <Heart
                          size={14}
                          className={`transition-colors ${isFav ? 'text-red-500 fill-red-500' : 'text-white'}`}
                        />
                      </button>
                    )}
                    {/* Static heart indicator (non-toggle) */}
                    {!showToggle && isFav && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Heart size={12} className="text-red-500 fill-red-500" />
                      </div>
                    )}
                  </div>
                </Link>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{game.title}</h4>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  {game.rating ? (
                    <>
                      <span className="text-yellow-500 font-bold">★</span>
                      <span className="font-semibold">{game.rating}</span>
                    </>
                  ) : (
                    <span>{game.meta}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
