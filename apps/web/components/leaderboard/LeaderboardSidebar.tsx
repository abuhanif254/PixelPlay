'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Crown, Clock, Calendar, CalendarDays, Gamepad2, ArrowRight } from 'lucide-react';

export default function LeaderboardSidebar() {
  const [activeMenu, setActiveMenu] = useState('Overview');

  const navItems = [
    { name: 'Overview', icon: <Crown size={18} /> },
    { name: 'All Time', icon: <Clock size={18} /> },
    { name: 'This Week', icon: <CalendarDays size={18} /> },
    { name: 'This Month', icon: <Calendar size={18} /> },
  ];

  const games = [
    { name: '2048', color: 'bg-orange-500' },
    { name: 'Snake', color: 'bg-green-500' },
    { name: 'Tic Tac Toe', color: 'bg-gray-400' },
    { name: 'Sudoku', color: 'bg-blue-400' },
    { name: 'Minesweeper', color: 'bg-red-500' },
    { name: 'Chess', color: 'bg-amber-600' },
    { name: 'Solitaire', color: 'bg-green-600' },
    { name: 'Word Search', color: 'bg-purple-500' },
    { name: 'Memory Match', color: 'bg-pink-500' },
    { name: 'Connect Four', color: 'bg-yellow-500' },
  ];

  const topPlayers = [
    { name: 'AlexGamer', score: '125,760', initial: 'A', color: 'bg-purple-500' },
    { name: 'PixelMaster', score: '98,540', initial: 'P', color: 'bg-orange-500' },
    { name: 'GameKnight', score: '74,230', initial: 'G', color: 'bg-blue-500' },
  ];

  return (
    <div className="w-full flex flex-col gap-8 pr-4">
      
      {/* Navigation */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-3">Leaderboard</h4>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveMenu(item.name)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeMenu === item.name 
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
        {games.map((game) => (
          <Link href={`/leaderboard/game/${game.name.toLowerCase().replace(/\s+/g, '-')}`} key={game.name} className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <div className={`w-5 h-5 rounded flex items-center justify-center ${game.color}`}>
              <Gamepad2 size={12} className="text-white" />
            </div>
            {game.name}
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
          {topPlayers.map((player) => (
            <div key={player.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${player.color}`}>
                  {player.initial}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{player.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{player.score}</span>
            </div>
          ))}
        </div>
        <Link href="#" className="flex items-center justify-center w-full py-2.5 mt-2 bg-transparent border border-gray-200 dark:border-white/10 hover:border-[#6366F1] hover:bg-gray-50 dark:hover:bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-bold rounded-xl transition-all">
          View Full Leaderboard
        </Link>
      </div>

    </div>
  );
}
