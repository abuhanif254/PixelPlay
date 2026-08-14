import React from 'react';
import { Gamepad2, CalendarDays, Globe2, Filter } from 'lucide-react';

export default function LeaderboardFilters() {
  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Filters</h3>
      
      <div className="flex flex-col gap-5">
        
        {/* Game Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Game</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Gamepad2 size={16} />
            </div>
            <select className="w-full bg-gray-50 dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 appearance-none focus:outline-none focus:border-[#6366F1] cursor-pointer">
              <option>All Games</option>
              <option>2048</option>
              <option>Snake</option>
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
            <select className="w-full bg-gray-50 dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 appearance-none focus:outline-none focus:border-[#6366F1] cursor-pointer">
              <option>This Week</option>
              <option>This Month</option>
              <option>All Time</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Region Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Region</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Globe2 size={16} />
            </div>
            <select className="w-full bg-gray-50 dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 appearance-none focus:outline-none focus:border-[#6366F1] cursor-pointer">
              <option>Global</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <button className="w-full mt-2 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl py-3 transition-colors flex items-center justify-center gap-2">
          <Filter size={16} />
          Apply Filters
        </button>

      </div>
    </div>
  );
}
