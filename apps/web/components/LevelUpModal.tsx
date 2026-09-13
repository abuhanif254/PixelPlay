'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Crown, X, ArrowRight, Share2 } from 'lucide-react';
import { LevelInfo } from '@/lib/progression';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function LevelUpModal() {
  const [levelUpData, setLevelUpData] = useState<{
    oldLevel: number;
    newLevel: number;
    levelInfo: LevelInfo;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    const handleLevelUp = (e: any) => {
      if (e.detail?.newLevel) {
        setLevelUpData(e.detail);
      }
    };
    window.addEventListener('spielcade:level-up', handleLevelUp as EventListener);
    return () => window.removeEventListener('spielcade:level-up', handleLevelUp as EventListener);
  }, []);

  if (!levelUpData) return null;

  const { newLevel, levelInfo } = levelUpData;

  const handleClose = () => {
    arcadeAudio.playBlip();
    setLevelUpData(null);
  };

  const handleShare = () => {
    arcadeAudio.playBlip();
    const text = `🏆 I just hit Level ${newLevel} (${levelInfo.rankTitle}) on Spielcade! Play free games and level up with me: https://spielcade.com`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Level Up on Spielcade!', text, url: 'https://spielcade.com' }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Copied level-up brag link to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0E1026] rounded-3xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Radiant Banner */}
          <div className={`p-8 text-center bg-gradient-to-b ${levelInfo.gradient} relative text-white overflow-hidden`}>
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Glowing Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-inner mb-4 animate-bounce">
              {levelInfo.rankBadge}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white/90 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-yellow-300 animate-spin" /> LEVEL UP!
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight">
              Level {newLevel} Unlocked!
            </h2>
            <p className="text-sm font-semibold text-white/90 mt-1">
              New Rank: <span className="underline decoration-wavy decoration-yellow-300">{levelInfo.rankTitle}</span>
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            <div className="bg-slate-50 dark:bg-black/30 rounded-2xl p-4 border border-slate-200 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>XP Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{levelInfo.totalXp.toLocaleString()} Total XP</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Level {newLevel}</span>
                <span>{levelInfo.xpNeededForNextLevel - levelInfo.xpInCurrentLevel} XP to Level {newLevel + 1}</span>
              </div>
            </div>

            {/* Perks Callout */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
              <Crown size={20} className="shrink-0 text-amber-500" />
              <div>
                <span className="font-extrabold block">Gamer Mastery Perk Activated!</span>
                <span>Daily streaks and leaderboard rank power increased.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleClose}
                type="button"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue Gaming</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleShare}
                type="button"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-white/10"
                title="Share your level up"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
