import React from 'react';
import { Globe, CalendarDays, Calendar, Clock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LeaderboardHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read active filter from URL, default to Global (All Time)
  const activeTime = searchParams.get('time') || 'All Time';
  const activeFilter = activeTime === 'All Time' ? 'Global' : activeTime;

  const handleFilterClick = (filterName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterName === 'Global' || filterName === 'All Time') {
      params.delete('time');
    } else {
      params.set('time', filterName);
    }
    router.push(`/leaderboard?${params.toString()}`);
  };

  const filters = [
    { name: 'Global', icon: <Globe size={16} /> },
    { name: 'This Week', icon: <CalendarDays size={16} /> },
    { name: 'This Month', icon: <Calendar size={16} /> },
    { name: 'All Time', icon: <Clock size={16} /> },
  ];

  return (
    <div className="w-full flex flex-col mb-8">
      
      {/* Header and Podium Graphic Area */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-transparent to-[#6366F1]/10 rounded-2xl mb-6 overflow-hidden flex items-center p-8 border border-gray-200 dark:border-white/5 shadow-sm">
        <div className="relative z-10 flex flex-col max-w-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2 flex items-center gap-3">
            Leaderboard 🏆
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Compete with players around the world and become the ultimate champion!
          </p>
        </div>
        
        {/* Placeholder for the 3D podium and gamepad graphic from the mockup */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:flex justify-end items-end p-4 pointer-events-none opacity-80">
           {/* We use a glowing effect and some geometric shapes to simulate the mockup's 3D assets */}
           <div className="relative w-full h-full flex justify-end items-end">
              <div className="absolute w-64 h-64 bg-[#6366F1]/30 blur-[80px] rounded-full top-0 right-10" />
              <div className="flex items-end gap-2 pb-4 pr-12">
                <div className="w-16 h-20 bg-gradient-to-t from-[#4338CA] to-[#6366F1] rounded-t-lg shadow-lg relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white font-bold opacity-50">2</div>
                </div>
                <div className="w-20 h-32 bg-gradient-to-t from-[#4338CA] to-[#6366F1] rounded-t-lg shadow-lg relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-yellow-400">
                    <svg className="w-8 h-8 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-t from-[#4338CA] to-[#6366F1] rounded-t-lg shadow-lg relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white font-bold opacity-50">3</div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => handleFilterClick(filter.name)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              activeFilter === filter.name
                ? 'bg-white dark:bg-[#1A1B3B] border-gray-200 dark:border-[#6366F1]/50 text-[#6366F1] dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-transparent border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-transparent'
            }`}
          >
            {filter.icon}
            {filter.name}
          </button>
        ))}
      </div>

    </div>
  );
}
