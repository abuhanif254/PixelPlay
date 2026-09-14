'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, Wifi, Sparkles, X, Gamepad2 } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-emerald-400/30 backdrop-blur-md">
          <Wifi size={16} className="text-emerald-200" />
          <span>You are back online! Leaderboards and cloud saves active.</span>
        </div>
      </div>
    );
  }

  if (!isOffline || isDismissed) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-50 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 text-white shadow-2xl animate-in slide-in-from-top-3 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center shrink-0 border border-white/20">
            <WifiOff size={16} className="text-amber-300" />
          </div>
          <div className="text-xs sm:text-sm font-medium truncate">
            <span className="font-extrabold uppercase tracking-wide text-amber-300">Offline Mode: </span>
            <span>No connection detected. Play our built-in offline games with zero internet:</span>
          </div>
        </div>

        {/* Offline Game Quick-Launch Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/offline"
            className="px-3 py-1 bg-white text-black text-xs font-black rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 shadow-sm"
          >
            <Gamepad2 size={13} />
            <span>Offline Hub</span>
          </Link>
          <Link
            href="/games/neon-snake"
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 backdrop-blur-sm hidden sm:flex"
          >
            <span>🐍 Snake</span>
          </Link>
          <Link
            href="/games/2048-classic"
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 backdrop-blur-sm hidden sm:flex"
          >
            <span>🔢 2048</span>
          </Link>
          <Link
            href="/games/neon-flyer"
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 backdrop-blur-sm hidden md:flex"
          >
            <span>🚀 Flyer</span>
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-white/80 hover:text-white rounded-md transition-colors ml-1"
            title="Dismiss offline banner"
            aria-label="Dismiss offline banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
