import React from 'react';
import Link from 'next/link';

export default function UserRankCard() {
  return (
    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-white mb-6">Your Rank</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-yellow-500/50 flex items-center justify-center shrink-0 bg-yellow-500/10 text-yellow-500">
           {/* Mock medal icon */}
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.97-1.31-3.24-3.15-3.24-.16 0-.33.01-.5.03v-1.6h-1.5v1.6c-1.63.31-2.8 1.4-2.8 2.94 0 2.05 1.57 2.84 3.73 3.39 1.98.51 2.45 1.15 2.45 1.92 0 1-.94 1.58-2.27 1.58-1.5 0-2.32-.77-2.4-1.91H7.55c.1 2 1.67 3.34 3.51 3.34.17 0 .33-.02.5-.04v1.65h1.5v-1.65c1.55-.28 2.83-1.31 2.83-2.97 0-2.07-1.53-2.85-3.58-3.38z"/></svg>
        </div>
        <div>
          <div className="text-3xl font-black font-outfit text-white leading-none tracking-tight">128</div>
        </div>
      </div>

      <div className="flex gap-4 p-3 bg-white/5 rounded-xl">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden shrink-0">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" alt="You" className="w-full h-full object-cover bg-[#6366F1]/20" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-bold text-white text-sm mb-0.5">You</span>
          <div className="flex items-center gap-1 mb-0.5">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span className="text-yellow-400 text-xs font-bold">2,450</span>
          </div>
          <span className="text-[10px] text-gray-500">Games Played: 18</span>
        </div>
      </div>

      <Link href="#" className="flex items-center justify-center w-full py-3 mt-4 bg-transparent border border-white/10 hover:border-[#6366F1] hover:bg-[#6366F1]/10 text-gray-400 hover:text-white text-sm font-bold rounded-xl transition-all">
        View Your Profile
      </Link>
    </div>
  );
}
