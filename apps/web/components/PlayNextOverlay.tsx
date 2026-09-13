'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, RotateCcw, X, Shuffle, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayNextGame {
  slug: string;
  title: string;
  image?: string;
  category?: string;
  rating?: number;
}

interface PlayNextOverlayProps {
  currentSlug: string;
  category: string;
  relatedGames?: PlayNextGame[];
  onDismiss: () => void;
  onPlayAgain?: () => void;
}

export default function PlayNextOverlay({
  currentSlug,
  category,
  relatedGames = [],
  onDismiss,
  onPlayAgain,
}: PlayNextOverlayProps) {
  const router = useRouter();

  // Filter out current game
  const candidates = relatedGames.filter(g => g.slug !== currentSlug);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentGame = candidates[selectedIndex] || {
    slug: 'snake',
    title: 'Neon Snake',
    image: '/images/games/snake.svg',
    category: 'Arcade',
    rating: 4.9,
  };

  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      router.push(`/games/${currentGame.slug}`);
      return;
    }

    timerRef.current = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, isPaused, currentGame.slug, router]);

  const handleShuffle = () => {
    if (candidates.length <= 1) return;
    setSelectedIndex(prev => (prev + 1) % candidates.length);
    setCountdown(5); // Reset countdown on manual shuffle
  };

  const handlePlayNow = () => {
    router.push(`/games/${currentGame.slug}`);
  };

  const handleCancel = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss();
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              <Sparkles size={13} className="text-yellow-400" />
              Play Next
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Starting in <strong className="text-white font-mono text-sm">{countdown}s</strong>
            </span>
          </div>

          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Cancel Autoplay"
          >
            <X size={18} />
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-5">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: isPaused ? `${(countdown / 5) * 100}%` : '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#EC4899]"
          />
        </div>

        {/* Game Preview Card */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg group mb-6">
          <div className="aspect-video w-full relative overflow-hidden">
            <img
              src={currentGame.image || '/images/games/snake.svg'}
              alt={currentGame.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/icons/icon-192x192.png';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayNow}
                className="w-14 h-14 rounded-full bg-[#6366F1] hover:bg-[#5457DF] text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <Play size={24} className="fill-current ml-0.5" />
              </button>
            </div>

            {/* Game Info Bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {currentGame.category || category}
                </span>
                <h4 className="text-base font-black text-white truncate drop-shadow-md">
                  {currentGame.title}
                </h4>
              </div>

              {currentGame.rating && (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[#F59E0B] text-xs font-bold shrink-0">
                  <Star size={12} className="fill-current" />
                  <span>{currentGame.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex items-center gap-2">
          {/* Play Now Primary */}
          <button
            onClick={handlePlayNow}
            className="flex-1 py-3 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#6366F1]/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            Play Now ({countdown}s)
          </button>

          {/* Shuffle to another game */}
          {candidates.length > 1 && (
            <button
              onClick={handleShuffle}
              className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer"
              title="Shuffle another game"
            >
              <Shuffle size={16} />
            </button>
          )}

          {/* Play Again (restarts current game) */}
          {onPlayAgain && (
            <button
              onClick={() => {
                handleCancel();
                onPlayAgain();
              }}
              className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer"
              title="Play Current Game Again"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>

        {/* Dismiss text */}
        <div className="text-center mt-3">
          <button
            onClick={handleCancel}
            className="text-[11px] text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            Stay on this game
          </button>
        </div>

      </div>
    </div>
  );
}
