'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Timer, Sparkles, ChevronRight, Swords, Flame, Award } from 'lucide-react';
import { getDailyTournament, getRemainingTournamentTime } from '@/lib/daily-cup';
import { arcadeAudio } from '@/lib/arcade-audio';

interface DailyCupBannerProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export default function DailyCupBanner({ className = '', variant = 'full' }: DailyCupBannerProps) {
  const [tournamentInfo, setTournamentInfo] = useState(() => getDailyTournament());
  const [countdown, setCountdown] = useState(() =>
    getRemainingTournamentTime(tournamentInfo.nextResetUtcMs)
  );
  const [showRewards, setShowRewards] = useState(false);

  // Keep countdown updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRemainingTournamentTime(tournamentInfo.nextResetUtcMs);
      if (remaining.isExpired) {
        // Rollover to next day's tournament
        const nextTournament = getDailyTournament();
        setTournamentInfo(nextTournament);
        setCountdown(getRemainingTournamentTime(nextTournament.nextResetUtcMs));
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tournamentInfo.nextResetUtcMs]);

  const game = tournamentInfo.game;

  const handlePlayClick = () => {
    arcadeAudio.playStart();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950/70 p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Radiant Golden Glow Background Accents */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
        {/* Left Side: Trophy Badge + Tournament Info */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          {/* Animated Trophy Icon Pod */}
          <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-300/40 transform hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-950 fill-amber-950" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
            </span>
          </div>

          {/* Title & Game of the Day */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Sparkles className="w-3 h-3" />
                Daily Arcade Cup
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-200/80 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                <Timer className="w-3 h-3 text-amber-400" />
                Resets: {countdown.formatted}
              </span>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2 truncate">
              <span>{game.icon}</span>
              <span className="truncate">{game.title}</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-white/10 text-gray-300 hidden sm:inline-block">
                {game.badge}
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-gray-400 truncate mt-0.5">
              🎯 <span className="text-gray-300 font-medium">{game.targetGoal}</span>
            </p>
          </div>
        </div>

        {/* Center / Right: Rewards Tiers & Call To Action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-2 sm:pt-0 border-t border-white/5 lg:border-t-0">
          {/* Tournament Prize Pool Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              onClick={() => setShowRewards(!showRewards)}
              role="button"
              tabIndex={0}
              className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/20 hover:border-amber-500/40 transition-colors text-xs"
              title="Click to toggle rewards details"
            >
              <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300">🥇 +500 XP</span>
                <span className="text-gray-500 text-[11px] hidden sm:inline">•</span>
                <span className="text-gray-400 text-[11px] hidden sm:inline">Top 3 Prizes</span>
              </div>
            </div>
          </div>

          {/* Quick Launch CTA Button */}
          <Link
            href={`/games/${game.slug}?tournament=daily-cup`}
            onClick={handlePlayClick}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95"
          >
            <Swords className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
            <span>Compete Now</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Expandable Prize Breakdown Accordion */}
      {showRewards && (
        <div className="mt-4 pt-3 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-black/30 p-2 rounded-xl border border-amber-500/20">
            <div className="font-bold text-amber-300">🥇 1st Champion</div>
            <div className="text-emerald-400 font-mono font-bold">+500 XP</div>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-slate-500/20">
            <div className="font-bold text-gray-300">🥈 2nd Master</div>
            <div className="text-emerald-400 font-mono font-bold">+300 XP</div>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-amber-700/20">
            <div className="font-bold text-amber-600">🥉 3rd Elite</div>
            <div className="text-emerald-400 font-mono font-bold">+150 XP</div>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-purple-500/20">
            <div className="font-bold text-purple-300">🎮 Any Participant</div>
            <div className="text-emerald-400 font-mono font-bold">+50 XP</div>
          </div>
        </div>
      )}
    </div>
  );
}
