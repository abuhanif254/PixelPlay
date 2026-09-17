'use client';

import React from 'react';
import { Trophy, Flame, Timer, Award, Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RelatedGame, fmtTime } from './types';

export interface PlayerGameOverScreenProps {
  liveScore: number | null;
  isNewRecord: boolean;
  sessionTime: number;
  personalBest: number | null;
  relatedGames?: RelatedGame[];
  onPlayAgain: () => void;
}

export default function PlayerGameOverScreen({
  liveScore,
  isNewRecord,
  sessionTime,
  personalBest,
  relatedGames = [],
  onPlayAgain,
}: PlayerGameOverScreenProps) {
  return (
    <motion.div
      key="game_over"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-4 md:p-8"
    >
      <h2 className="text-3xl md:text-4xl font-black text-white mb-1 font-outfit tracking-wide">Game Over</h2>

      {/* Score display */}
      {liveScore !== null && liveScore > 0 && (
        <div className="flex flex-col items-center gap-1 mb-3 px-6 py-2.5 bg-yellow-500/10 border border-yellow-400/25 rounded-2xl">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            <span className="text-yellow-300 font-black text-2xl">{liveScore.toLocaleString()}</span>
            <span className="text-yellow-400/60 text-xs font-semibold">pts</span>
          </div>
          {isNewRecord && (
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Flame size={12} /> New Personal Best Record!
            </span>
          )}
        </div>
      )}

      {/* Session Time & Record */}
      <div className="flex items-center gap-4 mb-5 text-gray-400 text-xs">
        {sessionTime > 0 && (
          <div className="flex items-center gap-1">
            <Timer size={13} /> <span>Played: {fmtTime(sessionTime)}</span>
          </div>
        )}
        {personalBest && (
          <div className="flex items-center gap-1 text-amber-400/90 font-semibold">
            <Award size={13} /> <span>Record: {personalBest.toLocaleString()} pts</span>
          </div>
        )}
      </div>

      <p className="text-gray-400 mb-5 text-xs sm:text-sm">
        Ready for your next run? Pick another challenge or jump back in:
      </p>

      {/* Dynamic Up Next recommendation grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 w-full max-w-2xl px-2">
        {(relatedGames && relatedGames.length > 0 ? relatedGames.slice(0, 4) : []).map((game: RelatedGame) => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            className="flex flex-col bg-slate-900 border border-white/10 hover:border-[#6366F1] rounded-xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black/40">
              {game.image ? (
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">
                  {game.title?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Play size={24} className="text-white fill-white" />
              </div>
            </div>
            <div className="p-2.5">
              <span className="text-white font-bold text-xs truncate block group-hover:text-[#6366F1] transition-colors">
                {game.title}
              </span>
              <span className="text-slate-400 text-[10px] block mt-0.5">
                {game.category} • ★ {Number(game.rating || 4.8).toFixed(1)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#5457DF] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.5)]"
        >
          <RotateCcw size={18} /> Play Again
        </button>
      </div>
    </motion.div>
  );
}
