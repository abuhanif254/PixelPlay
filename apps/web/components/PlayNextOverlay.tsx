'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, RotateCcw, X, Shuffle, Sparkles, Star, Flame, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSmartRecommendations } from '@/lib/recommendations';
import { getNextPlaylistGame } from '@/lib/playlists';
import { arcadeAudio } from '@/lib/arcade-audio';

interface PlayNextGame {
  slug: string;
  title: string;
  image?: string;
  category?: string;
  rating?: number;
  badge?: string;
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

  // Check if active session is in a Playlist Binge Queue
  const [playlistContext, setPlaylistContext] = useState<{ title: string; nextSlug: string; playlistSlug: string } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const plSlug = params.get('playlist');
      if (plSlug) {
        const next = getNextPlaylistGame(plSlug, currentSlug);
        if (next) {
          setPlaylistContext({
            title: next.title,
            nextSlug: next.slug,
            playlistSlug: plSlug,
          });
        }
      }
    } catch {}
  }, [currentSlug]);

  // Compute smart recommendations or combine with related catalog games
  const recommendations = useRef(getSmartRecommendations(currentSlug, category, 6));

  const candidates = relatedGames.length > 0
    ? relatedGames.filter((g) => g.slug !== currentSlug)
    : (recommendations.current.length > 0
        ? recommendations.current
        : [
            {
              slug: 'snake',
              title: 'Snake',
              image: '/images/games/snake.svg',
              category: 'Arcade',
              badge: '🔥 98% Match',
            },
            {
              slug: '2048',
              title: '2048',
              image: '/images/games/2048.svg',
              category: 'Puzzle',
              badge: '⚡ Trending',
            },
            {
              slug: 'flappy-bird',
              title: 'Flappy Bird',
              image: '/images/games/flappy-bird.svg',
              category: 'Arcade',
              badge: '⭐ Classic',
            },
          ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentGame = candidates[selectedIndex] || candidates[0] || {
    slug: 'snake',
    title: 'Snake',
    image: '/images/games/snake.svg',
    category: 'Arcade',
    badge: '🔥 98% Match',
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayNow();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, candidates]);

  // Countdown timer with audio tick
  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      handlePlayNow();
      return;
    }

    timerRef.current = setTimeout(() => {
      arcadeAudio.playBlip();
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, isPaused]);

  const handleShuffle = () => {
    arcadeAudio.playSelect();
    if (candidates.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % candidates.length);
    setCountdown(5); // Reset countdown
  };

  const handlePlayNow = () => {
    arcadeAudio.playStart();
    if (playlistContext) {
      router.push(`/games/${playlistContext.nextSlug}?playlist=${playlistContext.playlistSlug}`);
    } else {
      router.push(`/games/${currentGame.slug}`);
    }
  };

  const handleCancel = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss();
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Strip */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              <Sparkles size={13} className="text-yellow-400 animate-pulse" />
              Autoplay Theater Mode
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Next in <strong className="text-white font-mono text-sm">{countdown}s</strong>
            </span>
          </div>

          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Cancel Autoplay (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Animated Countdown Bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-5">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: isPaused ? `${(countdown / 5) * 100}%` : '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-[#6366F1] via-purple-500 to-[#EC4899]"
          />
        </div>

        {/* Recommended Game Preview Card */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg group mb-5">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            
            {/* Center Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayNow}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6366F1] to-purple-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Launch Game (Space)"
              >
                <Play size={24} className="fill-current ml-0.5" />
              </button>
            </div>

            {/* Game Info Bottom Strip */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                  {currentGame.category || category}
                </span>
                <h4 className="text-base font-black text-white truncate drop-shadow-md">
                  {currentGame.title}
                </h4>
              </div>

              {/* Match Score Badge */}
              <div className="flex items-center gap-1 bg-amber-500/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 text-xs font-black shrink-0">
                <span>{playlistContext ? `🎵 Next: ${playlistContext.title}` : (currentGame.badge || '🔥 98% Match')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Play Now Primary */}
          <button
            onClick={handlePlayNow}
            className="flex-1 py-3 bg-gradient-to-r from-[#6366F1] to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#6366F1]/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            <span>Play Now ({countdown}s)</span>
          </button>

          {/* Shuffle to another game */}
          {candidates.length > 1 && (
            <button
              onClick={handleShuffle}
              className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer"
              title="Shuffle another match (Right Arrow)"
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

        {/* Keyboard hints footer */}
        <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
          <button
            onClick={handleCancel}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Stay on this game (Esc)
          </button>

          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-gray-500">
            <Keyboard size={11} />
            <span>[Space] Launch • [→] Next</span>
          </span>
        </div>
      </div>
    </div>
  );
}
