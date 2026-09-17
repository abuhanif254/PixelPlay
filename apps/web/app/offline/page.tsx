'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wifi,
  WifiOff,
  Gamepad2,
  Play,
  RefreshCw,
  Trophy,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Download,
} from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';
import { getOfflineQueue, flushOfflineQueue } from '@/lib/offline-sync';

interface OfflineGameCard {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  controls: string;
  accentGradient: string;
  borderColor: string;
}

const OFFLINE_GAMES: OfflineGameCard[] = [
  {
    id: 'snake',
    slug: 'snake',
    title: 'Neon Snake',
    category: 'Arcade',
    icon: '🐍',
    description: 'Precision neon snake with glowing trails, speed multipliers, and full swipe controls.',
    controls: 'Arrow Keys / WASD / Swipe',
    accentGradient: 'from-emerald-500/20 to-green-600/10',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    id: '2048',
    slug: '2048',
    title: '2048 Classic',
    category: 'Puzzle',
    icon: '🔢',
    description: 'The legendary tile merger puzzle. Fully cached with local state storage and instant resume.',
    controls: 'Arrow Keys / Swipe',
    accentGradient: 'from-amber-500/20 to-orange-600/10',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
  },
  {
    id: 'flappy-bird',
    slug: 'flappy-bird',
    title: 'Neon Flyer',
    category: 'Arcade',
    icon: '🚀',
    description: 'Thrilling obstacle avoidance with real-time physics and instant tap-to-fly response.',
    controls: 'Space / Up Arrow / Tap',
    accentGradient: 'from-cyan-500/20 to-blue-600/10',
    borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
  },
];

export default function OfflineHubPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingScoresCount, setPendingScoresCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localScores, setLocalScores] = useState<Record<string, number>>({});
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    // Standalone check
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Read queue count
    setPendingScoresCount(getOfflineQueue().length);

    // Read local best scores from localStorage
    const scores: Record<string, number> = {};
    OFFLINE_GAMES.forEach((g) => {
      try {
        const val =
          localStorage.getItem(`spielcade_highscore_${g.slug}`) ||
          localStorage.getItem(`best_score_${g.slug}`) ||
          localStorage.getItem(`high_score_${g.slug}`);
        if (val) scores[g.slug] = parseInt(val, 10) || 0;
      } catch {}
    });
    setLocalScores(scores);

    const handleOnline = () => {
      setIsOnline(true);
      setPendingScoresCount(getOfflineQueue().length);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('You are currently offline. Connect to the internet to sync your queued high scores.');
      return;
    }

    setIsSyncing(true);
    arcadeAudio.playSelect();

    try {
      await flushOfflineQueue();
      setPendingScoresCount(getOfflineQueue().length);
      arcadeAudio.playLevelUp();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070818] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-x-clip">
      {/* Radiant Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        {/* Header Strip & Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles size={12} />
                PWA Evergreen Engine v4
              </span>

              {isOnline ? (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Wifi size={12} /> Connected
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <WifiOff size={12} /> Offline Mode Active
                </span>
              )}

              {isStandalone && (
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  📱 Installed App
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-outfit">
              Offline Arcade Hub
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-2xl">
              Zero connectivity? Zero problem. These flagship games run 100% locally from your device cache with zero network requirements.
            </p>
          </div>

          {/* Sync status card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:items-end justify-center shrink-0">
            <div className="text-xs font-bold text-gray-400">Offline Score Queue</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {pendingScoresCount} {pendingScoresCount === 1 ? 'Score' : 'Scores'} Queued
            </div>
            {isOnline && pendingScoresCount > 0 ? (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>Sync Now</span>
              </button>
            ) : (
              <span className="text-[11px] text-gray-500 mt-1">
                {pendingScoresCount === 0 ? 'All scores synchronized' : 'Auto-syncs on reconnect'}
              </span>
            )}
          </div>
        </div>

        {/* Offline Game Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Gamepad2 className="text-indigo-400" />
              <span>Verified Precached Titles</span>
            </h2>
            <span className="text-xs font-bold text-gray-400">Instant Canvas Execution</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFLINE_GAMES.map((game) => {
              const bestScore = localScores[game.slug];
              return (
                <div
                  key={game.id}
                  className={`relative rounded-3xl border bg-gradient-to-b ${game.accentGradient} ${game.borderColor} p-6 flex flex-col justify-between backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{game.icon}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/40 text-gray-300 border border-white/10">
                        {game.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white mb-1">{game.title}</h3>
                    <p className="text-[11px] text-indigo-300 font-mono mb-3">
                      Controls: {game.controls}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                      {game.description}
                    </p>
                  </div>

                  <div>
                    {bestScore !== undefined && bestScore > 0 && (
                      <div className="mb-4 px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Trophy size={13} className="text-amber-400" /> Local Best
                        </span>
                        <span className="font-mono font-bold text-white">{bestScore.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck size={13} />
                        Cached Offline
                      </span>

                      <Link
                        href={`/games/${game.slug}`}
                        onClick={() => arcadeAudio.playStart()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-gray-200 transition-all shadow-md active:scale-95"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Play Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resilience Architecture Callout */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/60 border border-purple-500/20 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <span>How Offline Progression Works</span>
              </h4>
              <p className="text-xs sm:text-sm text-gray-400">
                Play on flights, subway commutes, or spotty cellular connections. High scores are cryptographically queued in your browser storage and automatically sync to global leaderboards the moment you reconnect.
              </p>
            </div>

            {isOnline && (
              <Link
                href="/games"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shrink-0 transition-all shadow-lg shadow-purple-600/25 active:scale-95"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
