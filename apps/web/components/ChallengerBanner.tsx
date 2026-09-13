'use client';

import React, { useState } from 'react';
import { Swords, Trophy, Flame, Play, X } from 'lucide-react';

interface ChallengerBannerProps {
  challenger: string;
  score: string;
  gameTitle: string;
}

export default function ChallengerBanner({ challenger, score, gameTitle }: ChallengerBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handlePlayNow = () => {
    const playerWrapper = document.getElementById('player-stage') || document.querySelector('iframe');
    if (playerWrapper) {
      playerWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const formattedScore = parseInt(score) ? parseInt(score).toLocaleString() : score;

  return (
    <div className="w-full mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 p-0.5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative bg-white dark:bg-[#0D0E22] rounded-[15px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Challenger Notice */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/25 animate-bounce">
            <Swords size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <Flame size={12} className="text-rose-500 animate-pulse" /> Viral Match Challenge
              </span>
            </div>
            
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white mt-0.5 font-outfit">
              <span className="text-amber-500 font-black">@{challenger}</span> challenged you to beat{' '}
              <span className="text-rose-500 font-black underline decoration-2 underline-offset-2">{formattedScore} PTS</span> in {gameTitle}!
            </h3>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Think you have the skills? Beat this score and send the challenge right back!
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <button
            onClick={handlePlayNow}
            type="button"
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            Accept Challenge
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Dismiss Challenge Banner"
          >
            <X size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
