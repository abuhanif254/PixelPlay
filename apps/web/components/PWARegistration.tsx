'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export default function PWARegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;
    // Reload page when new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // 1. If a worker is already waiting, prompt immediately
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdateToast(true);
        }

        // 2. Listen for new incoming workers
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdateToast(true);
            }
          });
        });

        // 3. Check for updates every 30 minutes
        const updateInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 30 * 60 * 1000);

        return () => clearInterval(updateInterval);
      } catch (err) {
        console.warn('[PWA] Service Worker registration failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdateToast(false);
  };

  if (!showUpdateToast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-indigo-900 to-[#111228] border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold font-outfit truncate">New update available!</p>
            <p className="text-[11px] text-gray-300 truncate">Reload to get the latest games & fixes.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUpdate}
            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Update</span>
          </button>
          <button
            type="button"
            onClick={() => setShowUpdateToast(false)}
            className="p-1 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss update alert"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
