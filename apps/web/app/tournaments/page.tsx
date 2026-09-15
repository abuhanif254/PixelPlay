'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Timer,
  Sparkles,
  Users,
  Flame,
  Swords,
  Award,
  Crown,
  Medal,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Zap,
  Globe,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDailyTournament,
  getRemainingTournamentTime,
  UPCOMING_BLITZ_CUPS,
  TournamentStanding,
  CUP_REWARDS,
} from '@/lib/daily-cup';
import { arcadeAudio } from '@/lib/arcade-audio';

import { createClient } from '@/lib/supabase/client';

export const runtime = 'edge';

export default function TournamentsPage() {
  const [tournament, setTournament] = useState(() => getDailyTournament());
  const [countdown, setCountdown] = useState(() =>
    getRemainingTournamentTime(tournament.nextResetUtcMs)
  );
  const [activeTab, setActiveTab] = useState<'standings' | 'prizes' | 'schedule'>('standings');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRemainingTournamentTime(tournament.nextResetUtcMs);
      if (remaining.isExpired) {
        const next = getDailyTournament();
        setTournament(next);
        setCountdown(getRemainingTournamentTime(next.nextResetUtcMs));
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [tournament.nextResetUtcMs]);

  // Query real leaderboard scores for today's tournament game
  useEffect(() => {
    let isCancelled = false;

    async function loadLiveTournamentScores() {
      try {
        const supabase = createClient();
        const todayMidnight = new Date();
        todayMidnight.setUTCHours(0, 0, 0, 0);

        const { data: gameData } = await supabase
          .from('games')
          .select('id')
          .eq('slug', tournament.game.slug)
          .maybeSingle();

        if (gameData?.id) {
          const { data: realScores } = await supabase
            .from('scores')
            .select('id, score, created_at, profiles:user_id(username, avatar_url)')
            .eq('game_id', gameData.id)
            .gte('created_at', todayMidnight.toISOString())
            .order('score', { ascending: false })
            .limit(20);

          if (!isCancelled && realScores && realScores.length > 0) {
            const realStandings: TournamentStanding[] = realScores.map((s: any, idx: number) => ({
              rank: idx + 1,
              username: s.profiles?.username || `Player #${idx + 1}`,
              score: s.score,
              country: 'Global',
              avatar: s.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.profiles?.username || 'player'}&backgroundColor=b6e3f4`,
              isVerified: true,
              timeAgo: 'Today',
            }));

            if (realStandings.length < 3) {
              const fallback = tournament.standings.slice(realStandings.length);
              const merged = [
                ...realStandings,
                ...fallback.map((fb, i) => ({ ...fb, rank: realStandings.length + i + 1 })),
              ];
              setTournament((prev) => ({
                ...prev,
                standings: merged,
                totalEntrants: Math.max(prev.totalEntrants, realStandings.length),
              }));
            } else {
              setTournament((prev) => ({
                ...prev,
                standings: realStandings,
                totalEntrants: Math.max(prev.totalEntrants, realStandings.length),
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Tournament live score fetch fallback:', err);
      }
    }

    loadLiveTournamentScores();
    return () => {
      isCancelled = true;
    };
  }, [tournament.game.slug]);

  const handleShareTournament = async () => {
    arcadeAudio.playSelect();
    const shareData = {
      title: `Daily Cup: ${tournament.game.title} - Spielcade`,
      text: `Compete in today's Daily Arcade Cup on Spielcade! Can you beat the #1 score in ${tournament.game.title}?`,
      url: typeof window !== 'undefined' ? window.location.href : 'https://spielcade.com/tournaments',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {}
    }
  };

  const top3 = tournament.standings.slice(0, 3);
  const restStandings = tournament.standings.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0c16] text-gray-900 dark:text-gray-100 font-sans pb-24 transition-colors">
      {/* Dynamic Ambient Background Aura */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[650px] h-[650px] bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Header Breadcrumb & Tag */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-amber-500 font-bold">Tournament Arena</span>
          </div>

          <button
            onClick={handleShareTournament}
            type="button"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Share2 size={13} />
            <span>{shareSuccess ? 'Link Copied!' : 'Share Cup'}</span>
          </button>
        </div>

        {/* Hero Banner: Today's Active Tournament */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1c1810]/90 via-[#151228]/80 to-[#0e0f20]/95 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-2xl mb-12">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wider uppercase">
                <Flame size={14} className="animate-pulse text-amber-400" />
                <span>Daily Arcade Cup • {tournament.editionCode}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit text-white tracking-tight leading-tight">
                {tournament.game.title}
                <span className="block text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-extrabold mt-1">
                  {tournament.game.badge}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                Objective: <span className="text-white font-semibold">{tournament.game.targetGoal}</span>.
                Compete against global players. Every score submitted before midnight UTC is automatically ranked!
              </p>

              {/* Tournament Metric Chips */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                  <Timer size={15} className="text-amber-400" />
                  <span>Ends in: <strong className="text-amber-400 font-mono text-sm ml-1">{countdown.formatted}</strong></span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                  <Users size={15} className="text-indigo-400" />
                  <span>{tournament.totalEntrants.toLocaleString()} Active Competitors</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300">
                  <Sparkles size={15} />
                  <span>5,000 XP Prize Pool</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href={`/games/${tournament.game.slug}?tournament=${tournament.editionCode}`}
                  onClick={() => arcadeAudio.playStart()}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transform hover:scale-105 active:scale-95 transition-all"
                >
                  <Swords size={18} />
                  <span>Play In Daily Cup Now</span>
                </Link>

                <button
                  onClick={() => setActiveTab('prizes')}
                  type="button"
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <Award size={16} className="text-amber-400" />
                  <span>View Rewards</span>
                </button>
              </div>
            </div>

            {/* Right Card: Podium Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full bg-[#111227]/90 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Trophy size={16} />
                    <span>Live Podium Leaders</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                </div>

                {/* 1st, 2nd, 3rd Place Vertical Podium */}
                <div className="space-y-3">
                  {top3.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        player.rank === 1
                          ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/30'
                          : player.rank === 2
                          ? 'bg-gradient-to-r from-slate-400/15 via-slate-400/5 to-transparent border-slate-400/30'
                          : 'bg-gradient-to-r from-amber-700/15 via-amber-700/5 to-transparent border-amber-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs font-outfit shadow-md">
                          {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                        </div>
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-amber-400/50">
                          <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-white font-outfit">
                              {player.username}
                            </span>
                            <span className="text-xs">{player.country}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{player.timeAgo}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-sm sm:text-base font-black text-amber-400 font-mono">
                          {player.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-200/70 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl max-w-md mx-auto mb-8">
          <button
            onClick={() => {
              arcadeAudio.playSelect();
              setActiveTab('standings');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'standings'
                ? 'bg-white dark:bg-[#1c1d38] text-gray-900 dark:text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Trophy size={15} />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => {
              arcadeAudio.playSelect();
              setActiveTab('prizes');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'prizes'
                ? 'bg-white dark:bg-[#1c1d38] text-gray-900 dark:text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Award size={15} />
            <span>Prize Tiers</span>
          </button>

          <button
            onClick={() => {
              arcadeAudio.playSelect();
              setActiveTab('schedule');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-white dark:bg-[#1c1d38] text-gray-900 dark:text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={15} />
            <span>Weekend Blitz</span>
          </button>
        </div>

        {/* Tab 1: Full Standings Table */}
        {activeTab === 'standings' && (
          <div className="bg-white dark:bg-[#111227] border border-gray-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black font-outfit text-gray-900 dark:text-white flex items-center gap-2">
                  <Crown size={20} className="text-amber-400" />
                  Live Tournament Standings
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time ranking of top scores in today&apos;s active competition.
                </p>
              </div>

              <Link
                href={`/games/${tournament.game.slug}?tournament=${tournament.editionCode}`}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Swords size={14} />
                <span>Submit Your Score</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {tournament.standings.map((player) => (
                    <tr
                      key={player.rank}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black font-outfit ${
                            player.rank === 1
                              ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30'
                              : player.rank === 2
                              ? 'bg-slate-300 text-slate-900'
                              : player.rank === 3
                              ? 'bg-amber-700 text-amber-100'
                              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {player.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar}
                            alt={player.username}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-white/10"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900 dark:text-white font-outfit">
                              <span>{player.username}</span>
                              <span className="text-xs">{player.country}</span>
                              {player.isVerified && (
                                <ShieldCheck size={13} className="text-indigo-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-xs sm:text-sm font-mono text-amber-500 dark:text-amber-400">
                        {player.score.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {player.timeAgo}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/games/${tournament.game.slug}?challenger=${encodeURIComponent(
                            player.username
                          )}&score=${player.score}`}
                          onClick={() => arcadeAudio.playSelect()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 transition-all border border-indigo-500/20 active:scale-95"
                        >
                          <Swords size={12} />
                          <span>Challenge</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Prize Tiers & Rewards */}
        {activeTab === 'prizes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(CUP_REWARDS).map(([key, reward]) => (
              <div
                key={key}
                className="bg-white dark:bg-[#111227] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl mb-4">
                    {key === 'GOLD' ? '🥇' : key === 'SILVER' ? '🥈' : key === 'BRONZE' ? '🥉' : '🎖️'}
                  </div>

                  <h3 className="text-lg font-black text-gray-900 dark:text-white font-outfit">
                    {reward.label}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Awarded to players finishing at <strong className="text-gray-700 dark:text-gray-200">{reward.rank}</strong> by 23:59 UTC today.
                  </p>

                  <div className="pt-3 border-t border-gray-100 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-400">XP Bounty</span>
                      <span className="text-amber-400 font-mono">+{reward.xp} XP</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-400">Battle Stars</span>
                      <span className="text-indigo-400 font-mono">+{reward.stars} ⭐</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-400">Profile Title</span>
                      <span className="text-emerald-400">{reward.title}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
                  <span className="block text-[11px] text-center font-bold text-gray-400">
                    Auto-credited to player account on reset
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Upcoming Blitz Cups Schedule */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UPCOMING_BLITZ_CUPS.map((cup) => (
              <div
                key={cup.id}
                className="bg-white dark:bg-[#111227] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{cup.icon}</div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {cup.type} Event
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black font-outfit text-gray-900 dark:text-white">
                      {cup.title}
                    </h3>
                    <span className="text-xs text-amber-500 font-semibold">{cup.gameTitle}</span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Grand prize: <strong className="text-gray-800 dark:text-gray-200">{cup.prizePool}</strong>
                  </p>

                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs space-y-1">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Window Starts</span>
                      <strong className="text-gray-700 dark:text-gray-200">{cup.startDate}</strong>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Window Ends</span>
                      <strong className="text-gray-700 dark:text-gray-200">{cup.endDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
                  <Link
                    href={`/games/${cup.gameSlug}`}
                    className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Warm Up on {cup.gameTitle}</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
