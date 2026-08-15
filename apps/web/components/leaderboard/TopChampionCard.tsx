import React from 'react';
import Link from 'next/link';

export default function TopChampionCard({ champion = null }: { champion?: any }) {
  if (!champion) {
    return (
      <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden flex flex-col items-center text-center opacity-50">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-6 z-10">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.97-1.31-3.24-3.15-3.24-.16 0-.33.01-.5.03v-1.6h-1.5v1.6c-1.63.31-2.8 1.4-2.8 2.94 0 2.05 1.57 2.84 3.73 3.39 1.98.51 2.45 1.15 2.45 1.92 0 1-.94 1.58-2.27 1.58-1.5 0-2.32-.77-2.4-1.91H7.55c.1 2 1.67 3.34 3.51 3.34.17 0 .33-.02.5-.04v1.65h1.5v-1.65c1.55-.28 2.83-1.31 2.83-2.97 0-2.07-1.53-2.85-3.58-3.38z"/></svg>
          Top Champion
        </div>
        <p className="text-sm text-gray-500 mb-6">No champion yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden flex flex-col items-center text-center group">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#6366F1]/20 blur-[60px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-6 z-10">
        <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.97-1.31-3.24-3.15-3.24-.16 0-.33.01-.5.03v-1.6h-1.5v1.6c-1.63.31-2.8 1.4-2.8 2.94 0 2.05 1.57 2.84 3.73 3.39 1.98.51 2.45 1.15 2.45 1.92 0 1-.94 1.58-2.27 1.58-1.5 0-2.32-.77-2.4-1.91H7.55c.1 2 1.67 3.34 3.51 3.34.17 0 .33-.02.5-.04v1.65h1.5v-1.65c1.55-.28 2.83-1.31 2.83-2.97 0-2.07-1.53-2.85-3.58-3.38z"/></svg>
        Top Champion
      </div>

      <div className="relative mb-4 z-10">
        <svg className="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] z-20 group-hover:-translate-y-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
        </svg>
        
        {/* Floating stars */}
        <div className="absolute top-0 -left-6 w-3 h-3 bg-yellow-400 rotate-45 animate-pulse" />
        <div className="absolute top-10 -right-8 w-4 h-4 bg-yellow-400 rotate-45 animate-pulse delay-75" />
        <div className="absolute bottom-4 -left-8 w-2 h-2 bg-yellow-400 rotate-45 animate-pulse delay-150" />

        <div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-gray-100 dark:bg-white/10 p-1 relative z-10 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
          <img src={champion.avatar} alt="Champion" className="w-full h-full rounded-full object-cover" />
        </div>
      </div>

      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 z-10 truncate max-w-full">{champion.name}</h3>
      
      <div className="flex items-center gap-1.5 mb-6 z-10">
        <svg className="w-5 h-5 text-yellow-400 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="font-black text-xl text-yellow-400 drop-shadow">
          {champion.score}
        </span>
      </div>

      <Link href={`/profile/${champion.name}`} className="w-full py-3 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl transition-all shadow-lg z-10">
        View Profile
      </Link>
    </div>
  );
}
