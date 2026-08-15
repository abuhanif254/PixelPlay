'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gamepad2, CalendarDays, Filter } from 'lucide-react';

export default function LeaderboardFilters({ games = [], currentFilters = {} }: { games?: any[], currentFilters?: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const game = formData.get('game') as string;
    const time = formData.get('time') as string;

    const params = new URLSearchParams(searchParams.toString());
    
    if (game && game !== 'All Games') {
      params.set('game', game);
    } else {
      params.delete('game');
    }

    if (time && time !== 'All Time') {
      params.set('time', time);
    } else {
      params.delete('time');
    }

    router.push(`/leaderboard?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Filters</h3>
      
      <form onSubmit={handleApply} className="flex flex-col gap-5">
        
        {/* Game Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Game</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Gamepad2 size={16} />
            </div>
            <select name="game" defaultValue={currentFilters.game || 'All Games'} className="w-full bg-gray-50 dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 appearance-none focus:outline-none focus:border-[#6366F1] cursor-pointer">
              <option value="All Games">All Games</option>
              {games.map(g => (
                <option key={g.id} value={g.slug}>{g.title}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Time Period</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <CalendarDays size={16} />
            </div>
            <select name="time" defaultValue={currentFilters.time || 'All Time'} className="w-full bg-gray-50 dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 appearance-none focus:outline-none focus:border-[#6366F1] cursor-pointer">
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full mt-2 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl py-3 transition-colors flex items-center justify-center gap-2">
          <Filter size={16} />
          Apply Filters
        </button>

      </form>
    </div>
  );
}
