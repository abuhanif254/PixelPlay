import React from 'react';
import Link from 'next/link';

export default function LeaderboardTable() {
  const players = [
    { rank: 4, name: 'SpeedRunner', gamesPlayed: 201, score: '65,420', topGame: '2048', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SpeedRunner' },
    { rank: 5, name: 'BrainMaster', gamesPlayed: 176, score: '52,310', topGame: 'Sudoku', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BrainMaster' },
    { rank: 6, name: 'SnakeKing', gamesPlayed: 198, score: '48,760', topGame: 'Snake', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnakeKing' },
    { rank: 7, name: 'PuzzlePro', gamesPlayed: 156, score: '42,980', topGame: 'Minesweeper', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PuzzlePro' },
    { rank: 8, name: 'Charmander', gamesPlayed: 143, score: '39,210', topGame: 'Tic Tac Toe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charmander' },
    { rank: 9, name: 'LegendPlayz', gamesPlayed: 132, score: '36,540', topGame: 'Solitaire', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LegendPlayz' },
    { rank: 10, name: 'QuickShot', gamesPlayed: 128, score: '33,870', topGame: 'Word Search', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuickShot' },
  ];

  const badges = [
    { color: 'text-blue-400 bg-blue-400/10' },
    { color: 'text-orange-400 bg-orange-400/10' },
    { color: 'text-green-400 bg-green-400/10' },
    { color: 'text-purple-400 bg-purple-400/10' },
  ];

  return (
    <div className="w-full bg-[#1A1B3B] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col mb-10">
      
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-black/20">
        <div className="col-span-1">Rank</div>
        <div className="col-span-3">Player</div>
        <div className="col-span-2 text-center">Games Played</div>
        <div className="col-span-2 flex items-center gap-1">Score <span className="text-[10px] w-3 h-3 rounded-full border border-gray-500 flex items-center justify-center">?</span></div>
        <div className="col-span-1">Top Game</div>
        <div className="col-span-3 text-center">Achievements</div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {players.map((player, index) => (
          <div key={player.rank} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-white/5 ${index !== players.length - 1 ? 'border-b border-white/5' : ''}`}>
            <div className="col-span-1 font-medium text-gray-400">{player.rank}</div>
            
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 overflow-hidden shrink-0">
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-gray-200 truncate">{player.name}</span>
            </div>
            
            <div className="col-span-2 text-center font-medium text-gray-400">
              {player.gamesPlayed}
            </div>
            
            <div className="col-span-2 flex items-center gap-1.5 font-bold text-[#EAB308]">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {player.score}
            </div>

            <div className="col-span-1">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 truncate inline-block max-w-full">
                {player.topGame}
              </span>
            </div>

            <div className="col-span-3 flex items-center justify-between pl-4">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => {
                  const badge = badges[(player.rank + i) % badges.length];
                  return (
                    <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center ${badge.color}`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                  );
                })}
              </div>
              <Link href="#" className="px-3 py-1.5 text-xs font-bold text-[#6366F1] border border-[#6366F1]/30 rounded-lg hover:bg-[#6366F1]/10 transition-colors hidden sm:block">
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 py-6 border-t border-white/5">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#6366F1] text-white font-bold text-sm">1</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white font-bold text-sm transition-colors">2</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white font-bold text-sm transition-colors">3</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white font-bold text-sm transition-colors">4</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white font-bold text-sm transition-colors">5</button>
        <span className="text-gray-500 mx-1">...</span>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white font-bold text-sm transition-colors">50</button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white font-bold text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

    </div>
  );
}
