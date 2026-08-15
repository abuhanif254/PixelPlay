import React from 'react';
import Link from 'next/link';

export interface PlayerScore {
  userId?: string;
  rank: number;
  name: string;
  gamesPlayed?: number;
  score: string;
  topGame: string;
  avatar: string;
}

export default function LeaderboardTable({ players = [] }: { players?: PlayerScore[] }) {
  const badges = [
    { color: 'text-blue-400 bg-blue-400/10' },
    { color: 'text-orange-400 bg-orange-400/10' },
    { color: 'text-green-400 bg-green-400/10' },
    { color: 'text-purple-400 bg-purple-400/10' },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#1A1B3B] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col mb-10">
      
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-white/5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-black/20">
        <div className="col-span-1">Rank</div>
        <div className="col-span-3">Player</div>
        <div className="col-span-2 text-center">Games Played</div>
        <div className="col-span-2 flex items-center gap-1">Score</div>
        <div className="col-span-1">Top Game</div>
        <div className="col-span-3 text-center">Achievements</div>
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
          {players.map((player, index) => (
            <div key={`${player.rank}-${player.name}`} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${index !== players.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : ''}`}>
              <div className="col-span-1 font-medium text-gray-600 dark:text-gray-400">{player.rank}</div>
              
              <div className="col-span-3 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 overflow-hidden shrink-0">
                  <img src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-200 truncate" title={player.name}>{player.name}</span>
              </div>
              
              <div className="col-span-2 text-center font-medium text-gray-600 dark:text-gray-400">
                {player.gamesPlayed || 0}
              </div>
              
              <div className="col-span-2 flex items-center gap-1.5 font-bold text-[#EAB308]">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {player.score}
              </div>

              <div className="col-span-1">
                <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] text-gray-700 dark:text-gray-300 truncate inline-block max-w-[80px]" title={player.topGame}>
                  {player.topGame}
                </span>
              </div>

              <div className="col-span-3 flex items-center justify-between pl-4">
                <div className="flex gap-1.5 hidden md:flex">
                  {[0, 1, 2].map((i) => {
                    // Just show some random badges based on rank hash
                    const badge = badges[(player.rank + i) % badges.length];
                    return (
                      <div key={i} className={`w-5 h-5 rounded-md flex items-center justify-center ${badge.color}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                      </div>
                    );
                  })}
                </div>
                <Link href={`/profile/${player.name}`} className="px-3 py-1.5 text-xs font-bold text-[#6366F1] border border-[#6366F1]/30 rounded-lg hover:bg-[#6366F1]/10 transition-colors ml-auto">
                  Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
