import React from 'react';
import Link from 'next/link';

interface Game {
  title: string;
  image: string;
  meta: string;
  rating?: string;
  isFavorite?: boolean;
}

interface ProfileGameRowProps {
  title: string;
  games: Game[];
  viewAllLink: string;
}

export default function ProfileGameRow({ title, games, viewAllLink }: ProfileGameRowProps) {
  return (
    <div className="bg-[#111228] border border-white/5 rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <Link href={viewAllLink} className="text-[#6366F1] text-xs font-bold hover:text-white transition-colors">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {games.map((game, i) => (
          <div key={i} className="flex flex-col group relative">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-[#0A0B1A]">
              <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {game.isFavorite && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
              )}
            </div>
            <h4 className="text-sm font-bold text-white truncate">{game.title}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {game.rating ? (
                <>
                  <div className="flex items-center gap-0.5 text-yellow-500 font-bold">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {game.rating}
                  </div>
                </>
              ) : (
                <span>{game.meta}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
