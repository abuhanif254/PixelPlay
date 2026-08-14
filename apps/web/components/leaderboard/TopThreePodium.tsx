import React from 'react';

export default function TopThreePodium() {
  const topPlayers = [
    {
      rank: 2,
      name: 'PixelMaster',
      score: '98,540',
      gamesPlayed: 245,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PixelMaster&backgroundColor=b6e3f4',
      theme: {
        bg: 'bg-slate-100 dark:bg-gradient-to-b dark:from-[#1E293B] dark:to-[#0F172A]',
        border: 'border-slate-300 dark:border-slate-600',
        badge: 'bg-slate-300 text-slate-800',
        shadow: 'shadow-[0_0_30px_rgba(148,163,184,0.15)]'
      }
    },
    {
      rank: 1,
      name: 'AlexGamer',
      score: '125,760',
      gamesPlayed: 312,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexGamer&backgroundColor=f59e0b',
      theme: {
        bg: 'bg-yellow-50 dark:bg-gradient-to-b dark:from-[#78350F] dark:to-[#451A03]',
        border: 'border-yellow-400 dark:border-yellow-500',
        badge: 'bg-yellow-400 text-yellow-900',
        shadow: 'shadow-[0_0_40px_rgba(234,179,8,0.2)]'
      }
    },
    {
      rank: 3,
      name: 'GameKnight',
      score: '74,230',
      gamesPlayed: 189,
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GameKnight&backgroundColor=c0aede',
      theme: {
        bg: 'bg-amber-50 dark:bg-gradient-to-b dark:from-[#451A03] dark:to-[#2E1005]', // Using a bronze-ish tone
        border: 'border-amber-400 dark:border-amber-700',
        badge: 'bg-amber-600 text-amber-100',
        shadow: 'shadow-[0_0_30px_rgba(180,83,9,0.15)]'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
      {topPlayers.map((player) => (
        <div 
          key={player.rank}
          className={`relative rounded-2xl flex flex-col items-center justify-center p-6 border ${player.theme.bg} ${player.theme.border} ${player.theme.shadow} ${player.rank === 1 ? 'md:-mt-8 md:mb-4 h-64 z-10' : 'h-56'}`}
        >
          {/* Rank Badge */}
          <div className={`absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg border-2 border-black ${player.theme.badge}`}>
            {player.rank}
          </div>

          {/* Avatar Area */}
          <div className="relative mb-4">
            {player.rank === 1 && (
              <svg className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 text-yellow-400 drop-shadow-md z-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            )}
            <div className={`w-20 h-20 rounded-full border-4 ${player.theme.border} overflow-hidden bg-black/5 dark:bg-white/10 p-1 relative z-10 shadow-inner`}>
              <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
            </div>
            {/* Wreath graphic for 1st place mock */}
            {player.rank === 1 && (
              <>
                <svg className="absolute top-1 -left-10 w-12 h-24 text-yellow-500/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <svg className="absolute top-1 -right-10 w-12 h-24 text-yellow-500/50 scale-x-[-1]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </>
            )}
          </div>

          <h3 className={`font-bold text-gray-900 dark:text-white mb-1 ${player.rank === 1 ? 'text-xl' : 'text-lg'}`}>
            {player.name}
          </h3>
          
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className={`font-black ${player.rank === 1 ? 'text-xl text-yellow-600 dark:text-yellow-400' : 'text-lg text-gray-900 dark:text-white'}`}>
              {player.score}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-xs mt-auto">
            Games Played: {player.gamesPlayed}
          </p>

        </div>
      ))}
    </div>
  );
}
