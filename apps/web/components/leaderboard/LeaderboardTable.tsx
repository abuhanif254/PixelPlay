import React from 'react';
import Link from 'next/link';

export interface PlayerScore {
  userId?: string;
  rank: number;
  name: string;
  gamesPlayed?: number;
  score: string;
  topGame: string;
  gameSlug?: string;
  avatar: string;
}

export default function LeaderboardTable({ players = [] }: { players?: PlayerScore[] }) {
  return (
    <div className="w-full bg-white dark:bg-[#1A1B3B] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col mb-10">
      
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-white/5 text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-black/20">
        <div className="col-span-1">Rank</div>
        <div className="col-span-4 sm:col-span-3">Player</div>
        <div className="col-span-2 text-center hidden sm:block">Games</div>
        <div className="col-span-3 sm:col-span-2 flex items-center gap-1">Score</div>
        <div className="col-span-2 hidden md:block">Top Game</div>
        <div className="col-span-4 sm:col-span-4 md:col-span-2 text-right">Arena Actions</div>
      </div>

      {/* Table Body */}
      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="text-4xl mb-4">🏆</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No players found</h3>
          <p className="text-sm text-gray-500 mt-1">There are no scores recorded for these filters yet.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {players.map((player, index) => {
            const rawScore = (player.score || '0').replace(/,/g, '');
            const targetSlug = player.gameSlug || 'neon-snake';

            return (
              <div
                key={`${player.rank}-${player.name}`}
                className={`grid grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 items-center transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                  index !== players.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : ''
                }`}
              >
                <div className="col-span-1 font-mono font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  #{player.rank}
                </div>

                <div className="col-span-4 sm:col-span-3 flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6366F1]/20 overflow-hidden shrink-0 border border-white/10">
                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-200 truncate text-xs sm:text-sm" title={player.name}>
                    {player.name}
                  </span>
                </div>

                <div className="col-span-2 text-center font-medium text-gray-600 dark:text-gray-400 text-xs hidden sm:block">
                  {player.gamesPlayed || 0}
                </div>

                <div className="col-span-3 sm:col-span-2 flex items-center gap-1 font-mono font-black text-amber-500 text-xs sm:text-sm">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{player.score}</span>
                </div>

                <div className="col-span-2 hidden md:block">
                  <span
                    className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] text-gray-700 dark:text-gray-300 truncate inline-block max-w-[110px]"
                    title={player.topGame}
                  >
                    {player.topGame}
                  </span>
                </div>

                <div className="col-span-4 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1.5 sm:gap-2">
                  <Link
                    href={`/games/${targetSlug}?challenger=${encodeURIComponent(player.name)}&score=${rawScore}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-black text-amber-500 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    title={`Challenge ${player.name} to beat ${player.score}`}
                  >
                    <span>⚔️</span>
                    <span>Fight</span>
                  </Link>

                  <Link
                    href={`/profile/${player.name}`}
                    className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/10 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Card
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
