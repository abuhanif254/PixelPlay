'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Timer, Sparkles, Award, ExternalLink, X } from 'lucide-react';
import { getDailyTournament, getRemainingTournamentTime } from '@/lib/daily-cup';
import { arcadeAudio } from '@/lib/arcade-audio';

interface TournamentMatchRibbonProps {
  gameSlug: string;
  gameTitle: string;
}

export default function TournamentMatchRibbon({ gameSlug, gameTitle }: TournamentMatchRibbonProps) {
  const [tournamentInfo] = useState(() => getDailyTournament());
  const [countdown, setCountdown] = useState(() =>
    getRemainingTournamentTime(tournamentInfo.nextResetUtcMs)
  );
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getRemainingTournamentTime(tournamentInfo.nextResetUtcMs));
    }, 1000);
    return () => clearInterval(timer);
  }, [tournamentInfo.nextResetUtcMs]);

  const isCurrentGameTournament = tournamentInfo.game.slug === gameSlug;

  if (!isCurrentGameTournament || isDismissed) return null;

  return (
    <div className="w-full mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-0.5 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="relative bg-black/90 backdrop-blur-xl rounded-[15px] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Tournament Match Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-amber-950 shrink-0 shadow-lg shadow-amber-500/25">
            <Trophy size={20} className="fill-amber-950" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles size={11} /> Daily Arcade Cup Match
              </span>
              <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                {tournamentInfo.editionCode}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Timer size={12} />
                {countdown.formatted}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              Score submitted in this match will qualify for <span className="text-amber-400">🥇 1st (+500 XP)</span>, <span className="text-gray-300">🥈 2nd (+300 XP)</span>, & <span className="text-amber-600">🥉 3rd (+150 XP)</span> rewards!
            </p>
          </div>
        </div>

        {/* Right Side: Leaderboard Link + Close */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Link
            href="/tournaments"
            onClick={() => arcadeAudio.playSelect()}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Award size={14} />
            <span>View Cup Ranks</span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            type="button"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Dismiss tournament banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
