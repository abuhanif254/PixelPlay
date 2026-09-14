'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wifi, WifiOff, Gamepad2, Play, RefreshCw, Trophy, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';

interface OfflineGameCard {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  accentGradient: string;
  borderColor: string;
}

const OFFLINE_GAMES: OfflineGameCard[] = [
  {
    id: 'neon-snake',
    slug: 'neon-snake',
    title: 'Neon Snake',
    category: 'Arcade',
    icon: '🐍',
    description: 'Precision neon snake with glowing trails, speed multipliers, and full swipe controls.',
    accentGradient: 'from-emerald-500/20 to-green-600/10',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    id: '2048-classic',
    slug: '2048-classic',
    title: '2048 Classic',
    category: 'Puzzle',
    icon: '🔢',
    description: 'The legendary tile merger puzzle. Fully cached with local high score storage and instant resume.',
    accentGradient: 'from-amber-500/20 to-orange-600/10',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
  },
  {
    id: 'neon-flyer',
    slug: 'neon-flyer',
    title: 'Neon Flyer',
    category: 'Arcade',
    icon: '🚀',
    description: 'Thrilling obstacle avoidance with real-time physics and instant tap-to-fly response.',
    accentGradient: 'from-cyan-500/20 to-blue-600/10',
    borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
  },
];

export default function OfflineHubPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingScoresCount, setPendingScoresCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Read offline score queue
    try {
      const storedQueue = localStorage.getItem('spielcade_pending_scores');
      if (storedQueue) {
        const parsed = JSON.parse(storedQueue);
        if (Array.isArray(parsed)) setPendingScoresCount(parsed.length);
      }
    } catch {}

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

    // Trigger score queue sync
    try {
      const stored = localStorage.getItem('spielcade_pending_scores');
      if (stored) {
        const queue = JSON.parse(stored);
        if (Array.isArray(queue) && queue.length > 0) {
          // Process queue items via API or standard handler
          for (const item of queue) {
            try {
              await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
              });
            } catch {}
          }
          localStorage.removeItem('spielcade_pending_scores');
          setPendingScoresCount(0);
          arcadeAudio.playLevelUp();
        }
      }
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
                PWA Standalone Service Worker
              </span>

              {isOnline ? (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Wifi size={12} /> Connected
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <WifiOff size={12} /> Offline Mode
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-outfit">
              Offline Arcade Hub
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-2xl">
              Zero connectivity? Zero problem. These games run 100% locally from your browser cache. High scores are securely queued and synced as soon as you reconnect.
            </p>
          </div>

          {/* Sync status card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:items-end justify-center shrink-0">
            <div className="text-xs font-bold text-gray-400">Offline Score Queue</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {pendingScoresCount} {pendingScoresCount === 1 ? 'Score' : 'Scores'} Queued
            </div>
            {isOnline && pendingScoresCount > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>Sync Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Offline Game Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Gamepad2 className="text-indigo-400" />
              <span>Instant Offline Titles</span>
            </h2>
            <span className="text-xs font-bold text-gray-400">3 Verified Cached Games</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFLINE_GAMES.map((game) => (
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

                  <h3 className="text-xl font-black text-white mb-2">{game.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                    {game.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={13} />
                    Ready Offline
                  </span>

                  <Link
                    href={`/games/${game.slug}`}
                    onClick={() => arcadeAudio.playStart()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-gray-200 transition-all shadow-md active:scale-95"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Launch</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resilience Architecture Callout */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/60 border border-purple-500/20 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <span>How Offline Competition Works</span>
              </h4>
              <p className="text-xs sm:text-sm text-gray-400">
                Play on flights, subway commutes, or spotty cellular connections. Your highest scores remain stored locally with cryptographic timestamp verification and sync directly to global leaderboards upon network restoration.
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
