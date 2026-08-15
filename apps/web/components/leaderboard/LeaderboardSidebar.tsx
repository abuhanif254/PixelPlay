'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Crown, Clock, Calendar, CalendarDays, Gamepad2, ArrowRight } from 'lucide-react';

const COLORS = [
  'bg-orange-500', 'bg-green-500', 'bg-blue-400', 'bg-red-500', 
  'bg-amber-600', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500'
];

export default function LeaderboardSidebar({ games = [], topPlayers = [] }: { games?: any[], topPlayers?: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const timeParam = searchParams.get('time') || 'All Time';
  const gameParam = searchParams.get('game') || '';

  const navItems = [
    { name: 'All Time', icon: <Clock size={18} /> },
    { name: 'This Week', icon: <CalendarDays size={18} /> },
    { name: 'This Month', icon: <Calendar size={18} /> },
  ];

  const handleTimeClick = (time: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (time === 'All Time') params.delete('time');
    else params.set('time', time);
    router.push(`/leaderboard?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col gap-8 pr-4">
      
      {/* Navigation */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-3">Leaderboard</h4>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleTimeClick(item.name)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              timeParam === item.name 
                ? 'bg-[#6366F1]/10 text-[#6366F1]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </div>

      {/* By Game */}
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-3">By Game</h4>
        
        <Link 
          href={`/leaderboard`} 
          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            !gameParam ? 'bg-[#6366F1]/10 text-[#6366F1]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center bg-gray-400`}>
            <Crown size={12} className="text-white" />
          </div>
          All Games
        </Link>

        {games.slice(0, 8).map((game, idx) => (
          <Link 
            href={`/leaderboard?game=${game.slug}`} 
            key={game.id} 
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              gameParam === game.slug ? 'bg-[#6366F1]/10 text-[#6366F1]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center ${COLORS[idx % COLORS.length]}`}>
              <Gamepad2 size={12} className="text-white" />
            </div>
            {game.title}
          </Link>
        ))}
        <Link href="/games" className="flex items-center gap-2 px-4 py-2 mt-2 text-[#6366F1] hover:text-[#5457DF] text-sm font-bold transition-colors">
          View All Games <ArrowRight size={16} />
        </Link>
      </div>

      {/* Top Players */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 px-3">Top Players</h4>
        <div className="flex flex-col gap-3 px-2">
          {topPlayers.length === 0 ? (
            <p className="text-xs text-gray-500 px-2">No players yet.</p>
          ) : (
            topPlayers.map((player, idx) => (
              <Link href={`/profile/${player.name}`} key={player.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0`}>
                    <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px]">{player.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{player.score}</span>
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
