'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Monitor, Check } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already standalone PWA
    if (typeof window !== 'undefined') {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // 2. Check snooze / dismissal
      const dismissedUntil = localStorage.getItem('spielcade_pwa_dismissed');
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }

      // 3. Listen for browser install prompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setShowBanner(false);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Snooze for 7 days
    try {
      localStorage.setItem('spielcade_pwa_dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {}
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-[#111228] border border-indigo-500/30 dark:border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 relative overflow-hidden">
        
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left Icon */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30">
          <Download size={22} className="animate-bounce" />
        </div>

        {/* Center Content */}
        <div className="flex-grow min-w-0 pr-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              ⚡ Native App Experience
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white font-outfit truncate">
            Install Spielcade on your device
          </h4>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
            Play in fullscreen without browser tabs, faster 60FPS load times, and offline play.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-[#6366F1] hover:bg-[#5457DF] text-white text-xs font-bold rounded-lg shadow-md shadow-[#6366F1]/20 active:scale-95 transition-all cursor-pointer"
            >
              Install App
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X size={16} />
        </button>

      </div>
    </div>
  );
}
