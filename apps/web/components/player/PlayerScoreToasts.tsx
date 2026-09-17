'use client';

import React from 'react';
import {
  Trophy,
  Swords,
  Check,
  Heart,
  Zap,
  Flame,
  Award,
  Sparkles,
  Camera,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSaveStatus } from './types';

export interface PlayerScoreToastsProps {
  isMiniPlayer: boolean;
  challenger?: string;
  challengerScore?: number;
  liveScore: number | null;
  isNewRecord: boolean;
  showScoreToast: boolean;
  unlockedAchievement: { title: string; xp?: number } | null;
  shareToast: boolean;
  favToast: 'added' | 'removed' | null;
  screenshotToast: 'success' | 'postcard' | 'hint' | null;
  offlineSyncMsg: string | null;
  resumedCheckpointToast: boolean;
  cloudSaveStatus: CloudSaveStatus;
}

export default function PlayerScoreToasts({
  isMiniPlayer,
  challenger,
  challengerScore,
  liveScore,
  isNewRecord,
  showScoreToast,
  unlockedAchievement,
  shareToast,
  favToast,
  screenshotToast,
  offlineSyncMsg,
  resumedCheckpointToast,
  cloudSaveStatus,
}: PlayerScoreToastsProps) {
  return (
    <>
      {/* In-Game Ghost Target Tracker (Viral Score Challenge) */}
      {challenger && challengerScore && challengerScore > 0 && !isMiniPlayer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-4 z-[65] max-w-[calc(100%-120px)] sm:max-w-md pointer-events-auto"
        >
          <div
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all ${
              (liveScore || 0) >= challengerScore
                ? 'bg-emerald-950/90 border-emerald-400/60 shadow-[0_0_25px_rgba(52,211,153,0.4)]'
                : 'bg-[#0B0D21]/90 border-rose-500/40 shadow-xl'
            }`}
          >
            {/* Icon */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                (liveScore || 0) >= challengerScore
                  ? 'bg-emerald-500 text-white animate-bounce'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {(liveScore || 0) >= challengerScore ? <Trophy size={16} /> : <Swords size={16} />}
            </div>

            {/* Target & Score details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 truncate">
                  Target: <span className="text-amber-400 font-extrabold">@{challenger}</span> ({challengerScore.toLocaleString()} PTS)
                </span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
                    (liveScore || 0) >= challengerScore
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {(liveScore || 0) >= challengerScore ? 'BEATEN!' : 'CHALLENGE'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden my-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    (liveScore || 0) >= challengerScore
                      ? 'bg-emerald-400'
                      : 'bg-gradient-to-r from-rose-500 to-amber-400'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (((liveScore || 0) / challengerScore) * 100)))}%`,
                  }}
                />
              </div>

              {/* Live Delta */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono text-white/90">
                  Score: <span className="font-bold">{(liveScore || 0).toLocaleString()}</span>
                </span>
                {(liveScore || 0) >= challengerScore ? (
                  <span className="text-emerald-400 font-black animate-pulse">
                    +{((liveScore ?? 0) - challengerScore).toLocaleString()} Ahead!
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold">
                    Need +{(challengerScore - (liveScore || 0)).toLocaleString()} to Beat!
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/30"
          >
            <Check size={14} className="stroke-[3]" /> Link copied with your score!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorite Toast */}
      <AnimatePresence>
        {favToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border backdrop-blur-md ${
              favToast === 'added'
                ? 'bg-red-600/95 text-white border-red-400/40 shadow-red-500/25'
                : 'bg-gray-800/95 text-gray-200 border-white/20'
            }`}
          >
            <Heart size={14} className={favToast === 'added' ? 'fill-white stroke-[2.5]' : 'stroke-[2.5]'} />
            {favToast === 'added' ? 'Added to your favorites!' : 'Removed from favorites'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Toast & New Record Banner */}
      <AnimatePresence>
        {showScoreToast && liveScore !== null && !isMiniPlayer && (
          <motion.div
            key="score"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 z-[70] pointer-events-none"
          >
            <div className="bg-black/90 border border-yellow-400/40 text-yellow-300 px-6 py-3 rounded-2xl text-lg font-black backdrop-blur-md shadow-2xl flex flex-col items-center gap-1">
              <div className="flex items-center gap-2.5">
                <Trophy size={20} className="text-yellow-400" />
                <span>+{liveScore.toLocaleString()} pts</span>
                <Zap size={16} className="text-yellow-300" />
              </div>
              {isNewRecord && (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Flame size={12} /> NEW PERSONAL RECORD!
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notification Banner (Xbox / Steam Style) */}
      <AnimatePresence>
        {unlockedAchievement && !isMiniPlayer && (
          <motion.div
            key="ach"
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute top-5 left-1/2 -translate-x-1/2 z-[80] bg-[#111228]/95 border border-yellow-500/40 text-white px-5 py-3 rounded-2xl backdrop-blur-xl shadow-[0_10px_35px_rgba(234,179,8,0.3)] flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-yellow-400 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-yellow-400 tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Achievement Unlocked
              </span>
              <h4 className="text-sm font-bold text-white font-outfit">{unlockedAchievement.title}</h4>
            </div>
            {unlockedAchievement.xp && (
              <span className="ml-2 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 rounded-lg text-xs font-black">
                +{unlockedAchievement.xp} XP
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Queue Sync Toast Banner */}
      <AnimatePresence>
        {offlineSyncMsg && !isMiniPlayer && (
          <motion.div
            key="offline-sync"
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[85] bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-5 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center gap-2.5 font-bold text-xs"
          >
            <Trophy size={16} className="text-yellow-400" />
            <span>{offlineSyncMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cross-Device Checkpoint Restored Toast Banner */}
      <AnimatePresence>
        {resumedCheckpointToast && !isMiniPlayer && (
          <motion.div
            key="cross-device-resume"
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[85] bg-indigo-950/95 border border-indigo-500/50 text-indigo-200 px-5 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center gap-2.5 font-bold text-xs"
          >
            <Sparkles size={16} className="text-yellow-400 animate-spin" />
            <span>📱 Cross-Device Save Checkpoint Restored!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot Toast Notification */}
      <AnimatePresence>
        {screenshotToast && (
          <motion.div
            key="sshot"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-6 right-4 z-[70] px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 ${
              screenshotToast === 'success'
                ? 'bg-emerald-600 text-white border border-emerald-400/30'
                : screenshotToast === 'postcard'
                  ? 'bg-[#6366F1] text-white border border-indigo-400/30'
                  : 'bg-gray-800 text-gray-200 border border-white/10'
            }`}
          >
            <Camera size={13} />
            {screenshotToast === 'success' && 'Gameplay snapshot downloaded!'}
            {screenshotToast === 'postcard' && 'Gamer card saved to downloads!'}
            {screenshotToast === 'hint' && 'Use Windows+Shift+S / Cmd+Shift+4'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloud Save Pill */}
      <AnimatePresence>
        {cloudSaveStatus !== 'idle' && !isMiniPlayer && (
          <motion.div
            key="cloud"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none ${
              cloudSaveStatus === 'error'
                ? 'bg-red-900/80 border-red-500/30 text-red-300'
                : cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading'
                  ? 'bg-blue-900/80 border-blue-500/30 text-blue-200'
                  : 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {(cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading') && (
              <Loader2 size={12} className="animate-spin" />
            )}
            {cloudSaveStatus === 'saving' && '💾 Saving to cloud...'}
            {cloudSaveStatus === 'saved' && '☁️ Cloud Save Synced'}
            {cloudSaveStatus === 'loading' && '☁️ Loading Save...'}
            {cloudSaveStatus === 'loaded' && '☁️ Save Loaded'}
            {cloudSaveStatus === 'error' && '⚠️ Save Error'}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
