"use client";

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { 
  Play, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  MonitorX, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Share2, 
  Heart, 
  Flag, 
  Check, 
  X, 
  Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecentGames } from '@/hooks/useRecentGames';
import { saveGameState, loadGameState } from '@/app/games/actions';
import { toggleFavoriteGame } from '@/app/profile/actions';
import AdBanner from '@/components/AdBanner';

type PlayerState = 'idle' | 'ad' | 'rewarded_ad' | 'playing' | 'game_over';

interface GamePlayerProps {
  children?: React.ReactNode;
  title: string;
  slug: string;
  category?: string;
  image?: string;
  sourceUrl?: string | null;
  onGameOver?: (score: number) => void;
  relatedGames?: Array<{
    id?: string;
    slug: string;
    title: string;
    image?: string;
    category?: string;
    rating?: number;
    totalPlays?: number;
  }>;
  gameId?: string;
  initialFavorited?: boolean;
}

export default function GamePlayer({ 
  children, 
  title, 
  slug, 
  category,
  image, 
  sourceUrl, 
  onGameOver,
  relatedGames = [],
  gameId,
  initialFavorited = false,
}: GamePlayerProps) {
  const router = useRouter();
  const { addRecentGame } = useRecentGames();
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWebFullscreen, setIsWebFullscreen] = useState(false); // iOS Safari & Mobile fallback
  const [reloadKey, setReloadKey] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [rewardedAdMsgId, setRewardedAdMsgId] = useState<number | null>(null);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPendingFav, startTransition] = useTransition();
  const [shareToast, setShareToast] = useState(false);
  const [showHud, setShowHud] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasRecordedRef = useRef(false);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Sync initialFavorited updates
  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  // Mobile Screen WakeLock API (prevents phone screen from dimming/sleeping during active play)
  useEffect(() => {
    const handleWakeLock = async () => {
      if (playerState === 'playing' && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          // Ignore wake lock error (e.g. battery saver mode)
        }
      } else if (playerState !== 'playing' && wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };

    handleWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [playerState]);

  // Body scroll lock during Theater Mode or Web Fullscreen
  useEffect(() => {
    if (isTheater || isWebFullscreen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isTheater, isWebFullscreen]);

  // In-Game HUD auto-hide timer (3.2 seconds of stillness during theater or fullscreen)
  const resetHudTimer = () => {
    setShowHud(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    if (isTheater || isFullscreen || isWebFullscreen) {
      hudTimerRef.current = setTimeout(() => {
        setShowHud(false);
      }, 3200);
    }
  };

  useEffect(() => {
    if (isTheater || isFullscreen || isWebFullscreen) {
      resetHudTimer();
    } else {
      setShowHud(true);
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    }
  }, [isTheater, isFullscreen, isWebFullscreen]);

  // Handle Play Button Click
  const handlePlay = () => {
    setPlayerState('ad');
    addRecentGame({
      slug,
      title,
      image,
    });
  };

  // Auto-record session into Recent Games safely once on mount
  useEffect(() => {
    if (slug && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      addRecentGame({
        slug,
        title,
        image,
      });
    }
  }, [slug, title, image, addRecentGame]);

  // Pre-roll Ad Countdown Logic
  useEffect(() => {
    if ((playerState === 'ad' || playerState === 'rewarded_ad') && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [playerState, adCountdown]);

  const skipAd = () => {
    setPlayerState('playing');
    // Auto-focus the game iframe
    setTimeout(() => {
      iframeRef.current?.focus();
    }, 100);
  };

  const completeRewardedAd = () => {
    setPlayerState('playing');
    if (rewardedAdMsgId !== null) {
      const iframe = iframeRef.current || containerRef.current?.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({
          source: 'SPIELCADE_WRAPPER',
          type: 'REWARDED_AD_COMPLETE',
          payload: { success: true },
          msgId: rewardedAdMsgId
        }, '*');
      }
      setRewardedAdMsgId(null);
    }
  };

  // Real Audio Mute Dispatcher (posts standard mute messages to game window)
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const iframe = iframeRef.current || containerRef.current?.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'SET_MUTE', isMuted: nextMuted, mute: nextMuted }, '*');
      iframe.contentWindow.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'MUTE', payload: { isMuted: nextMuted } }, '*');
      iframe.contentWindow.postMessage(JSON.stringify({ action: nextMuted ? 'mute' : 'unmute' }), '*');
    }
  };

  // Instant Game Reload (remounts iframe without page refresh)
  const handleReload = () => {
    setIsReloading(true);
    setReloadKey(prev => prev + 1);
    setTimeout(() => {
      setIsReloading(false);
      iframeRef.current?.focus();
    }, 600);
  };

  // Universal Fullscreen Logic (native fullscreen with iOS Safari & mobile orientation fallback)
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    } else if (isWebFullscreen) {
      setIsWebFullscreen(false);
    } else if (containerRef.current) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
          setIsTheater(false);
          // Try landscape orientation lock on mobile devices if supported
          if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock('landscape').catch(() => {});
          }
        } else {
          // Fallback for iOS Safari (which blocks div requestFullscreen)
          setIsWebFullscreen(true);
          setIsTheater(false);
        }
      } catch (err) {
        // requestFullscreen failed or blocked -> Use CSS Web Fullscreen
        setIsWebFullscreen(true);
        setIsTheater(false);
      }
    }
  };

  // Native Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (active) setIsTheater(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Desktop Keyboard Scroll-Lock & Gaming Hotkeys
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (playerState !== 'playing') return;

      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isInput) return;

      // Prevent Spacebar & Arrow keys from scrolling webpage during gameplay
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        if (containerRef.current?.contains(document.activeElement) || document.activeElement === document.body) {
          e.preventDefault();
        }
      }

      // Hotkeys: F (Fullscreen), T (Theater), M (Mute), R (Reload), Esc (Exit)
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTheater(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReload();
      } else if (e.key === 'Escape') {
        if (isTheater) setIsTheater(false);
        if (isWebFullscreen) setIsWebFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [playerState, isTheater, isWebFullscreen, isMuted]);

  // SDK & Game Message Protocol Communication
  useEffect(() => {
    if (playerState !== 'playing' || !sourceUrl) return;

    const handleMessage = async (event: MessageEvent) => {
      if (!event.data) return;

      // 1. SPIELCADE_SDK standard protocol
      if (event.data.source === 'SPIELCADE_SDK') {
        switch (event.data.type) {
          case 'SUBMIT_SCORE':
            if (onGameOver && typeof event.data.payload?.score === 'number') {
              onGameOver(event.data.payload.score);
            }
            break;
          case 'GAME_OVER':
            setPlayerState('game_over');
            break;
          case 'SHOW_REWARDED_AD':
            setAdCountdown(5);
            setRewardedAdMsgId(event.data.msgId);
            setPlayerState('rewarded_ad');
            break;
          case 'SAVE_DATA':
            {
              const res = await saveGameState(slug, event.data.payload.data);
              event.source?.postMessage({
                source: 'SPIELCADE_WRAPPER',
                type: 'SAVE_DATA_RESPONSE',
                payload: res,
                msgId: event.data.msgId
              }, { targetOrigin: '*' });
            }
            break;
          case 'LOAD_DATA':
            {
              const res = await loadGameState(slug);
              event.source?.postMessage({
                source: 'SPIELCADE_WRAPPER',
                type: 'LOAD_DATA_RESPONSE',
                payload: res,
                msgId: event.data.msgId
              }, { targetOrigin: '*' });
            }
            break;
        }
      }

      // 2. Generic HTML5 / GameMonetize / GameDistribution score & gameover events
      try {
        const raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (raw && (raw.type === 'score' || raw.type === 'gameover' || raw.action === 'game_over' || raw.event === 'gameover' || raw.name === 'gameOver')) {
          const detectedScore = Number(raw.score || raw.points || raw.value || raw.finalScore || 0);
          if (detectedScore > 0 && onGameOver) {
            onGameOver(detectedScore);
          }
        }
      } catch (e) {
        // Not a JSON string
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playerState, sourceUrl, onGameOver, slug]);

  const handleToggleFavorite = () => {
    if (!gameId) {
      alert('Please sign in to add games to your favorites!');
      return;
    }
    const nextState = !isFavorited;
    setIsFavorited(nextState);
    startTransition(async () => {
      const res = await toggleFavoriteGame(gameId);
      if (!res.success) {
        setIsFavorited(!nextState);
        if (res.error === 'Unauthorized') {
          alert('You must be logged in to favorite games!');
        }
      }
    });
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `Play ${title} Unblocked | Spielcade`,
      text: `Play ${title} for free online in your browser with no downloads!`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const handleReport = () => {
    window.open(`/contact?subject=Report%20Game%20Issue&game=${encodeURIComponent(slug)}`, '_blank');
  };

  return (
    <div className="w-full flex flex-col select-none">
      
      {/* Primary Game Display Canvas */}
      <div 
        ref={containerRef}
        onMouseMove={resetHudTimer}
        onTouchStart={resetHudTimer}
        className={`relative w-full bg-black overflow-hidden shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-center touch-manipulation ${
          isWebFullscreen
            ? 'fixed inset-0 z-[1000] w-screen h-screen rounded-none'
            : isTheater 
              ? 'fixed inset-2 md:inset-6 lg:inset-10 z-[100] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10' 
              : 'aspect-video w-full min-h-[260px] sm:min-h-[380px] md:min-h-[480px] xl:min-h-[560px] rounded-2xl border border-gray-200 dark:border-white/10'
        }`}
      >
        {/* Theater Mode Background Dimming */}
        {isTheater && !document.fullscreenElement && (
          <div 
            className="fixed inset-0 bg-black/95 z-[-1] backdrop-blur-md" 
            onClick={() => setIsTheater(false)}
          />
        )}

        <AnimatePresence mode="wait">
          
          {/* 1. IDLE STATE: High-Impact Poster & Play Button */}
          {playerState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 group cursor-pointer"
              onClick={handlePlay}
            >
              {image && (
                <img 
                  src={image} 
                  alt={title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" 
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-5 p-4 text-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay();
                  }}
                  className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#6366F1] text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_50px_rgba(99,102,241,0.7)]"
                  aria-label={`Play ${title}`}
                >
                  <div className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-30"></div>
                  <Play size={40} className="ml-2 fill-white" />
                </button>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide drop-shadow-xl font-outfit">
                    Play {title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium">
                    Free Instant Play • No Downloads • Unblocked
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. PRE-ROLL AD & ASSET LOADING STATE */}
          {playerState === 'ad' && (
            <motion.div 
              key="ad"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20 p-6"
            >
              <div className="absolute top-6 left-6 text-white/60 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                Loading Game Assets
              </div>
              
              <div className="w-full max-w-md p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-[#6366F1] border-t-transparent animate-spin mb-6 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                <h3 className="text-white font-bold text-lg sm:text-xl mb-2 font-outfit">Starting {title}...</h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-xs">
                  Your game is initializing. Support independent game creators by viewing sponsor announcements.
                </p>
              </div>

              <div className="absolute bottom-6 right-6">
                {adCountdown > 0 ? (
                  <div className="px-5 py-2.5 bg-black/60 border border-white/10 text-white/70 rounded-full text-xs font-bold backdrop-blur-md">
                    Skip Ad in {adCountdown}s
                  </div>
                ) : (
                  <button 
                    onClick={skipAd}
                    className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 rounded-full text-xs sm:text-sm font-bold shadow-2xl transition-all flex items-center gap-2"
                  >
                    Play Now <Play size={14} className="fill-black" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* 2.5 REWARDED AD STATE */}
          {playerState === 'rewarded_ad' && (
            <motion.div 
              key="rewarded_ad"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-40 backdrop-blur-sm p-6"
            >
              <div className="absolute top-6 left-6 text-white/60 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                Rewarded Sponsor
              </div>
              
              <div className="w-full max-w-md p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mb-6 shadow-[0_0_20px_rgba(234,179,8,0.5)]"></div>
                <h3 className="text-white font-bold text-lg sm:text-xl mb-2 font-outfit">Claiming In-Game Reward...</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Please do not close this window while the reward verifies.</p>
              </div>

              <div className="absolute bottom-6 right-6">
                {adCountdown > 0 ? (
                  <div className="px-5 py-2.5 bg-black/60 border border-white/10 text-white/70 rounded-full text-xs font-bold backdrop-blur-md">
                    Reward in {adCountdown}s
                  </div>
                ) : (
                  <button 
                    onClick={completeRewardedAd}
                    className="px-6 py-2.5 bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 active:scale-95 rounded-full text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all flex items-center gap-2"
                  >
                    Claim Reward <Play size={14} className="fill-black" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* 3. ACTIVE PLAYING CANVAS */}
          {playerState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-row relative z-10 bg-black overflow-hidden"
            >
              {/* Left Skyscraper Ad (Visible on wide screens & theater mode) */}
              <div className={`hidden ${isTheater ? 'xl:flex' : '2xl:flex'} flex-col justify-center items-center px-3 bg-gray-950 border-r border-white/5 z-20 shrink-0`}>
                <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
              </div>

              {/* Game Viewport Container */}
              <div className="flex-1 h-full relative flex justify-center items-center pointer-events-auto z-10 min-w-0">
                {sourceUrl ? (
                  <iframe 
                    key={reloadKey}
                    ref={iframeRef}
                    src={sourceUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-modals"
                    allow="fullscreen; autoplay; gamepad; focus-without-user-activation; accelerometer; gyroscope; clipboard-write"
                    title={title}
                  />
                ) : (
                  children
                )}
              </div>

              {/* Right Skyscraper Ad (Visible on wide screens & theater mode) */}
              <div className={`hidden ${isTheater ? 'xl:flex' : '2xl:flex'} flex-col justify-center items-center px-3 bg-gray-950 border-l border-white/5 z-20 shrink-0`}>
                <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
              </div>

              {/* Share Toast Notification */}
              <AnimatePresence>
                {shareToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/30"
                  >
                    <Check size={14} className="text-white stroke-[3]" /> Link copied to clipboard!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auto-Hiding In-Game HUD (Shown in Theater, Fullscreen, or Web Fullscreen modes) */}
              {(isTheater || isFullscreen || isWebFullscreen) && (
                <AnimatePresence>
                  {showHud && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 50, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50 px-4"
                    >
                      <div className="bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-2.5 flex items-center gap-4 sm:gap-6 shadow-2xl pointer-events-auto">
                        <span className="text-xs font-bold text-white max-w-[140px] sm:max-w-xs truncate font-outfit">
                          {title}
                        </span>

                        <div className="w-px h-5 bg-white/15" />

                        <button 
                          onClick={handleReload}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all" 
                          title="Restart Game (R)"
                        >
                          <RotateCcw size={18} className={isReloading ? "animate-spin text-[#6366F1]" : ""} />
                        </button>

                        <button 
                          onClick={handleToggleMute}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all" 
                          title={isMuted ? "Unmute (M)" : "Mute (M)"}
                        >
                          {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
                        </button>

                        {isTheater && (
                          <button 
                            onClick={() => setIsTheater(false)}
                            className="text-[#6366F1] hover:text-white hover:scale-110 transition-all" 
                            title="Exit Theater Mode (Esc / T)"
                          >
                            <MonitorX size={18} />
                          </button>
                        )}

                        <button 
                          onClick={toggleFullscreen}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all" 
                          title={isFullscreen || isWebFullscreen ? "Exit Fullscreen (Esc / F)" : "Fullscreen (F)"}
                        >
                          {isFullscreen || isWebFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>

                        <div className="w-px h-5 bg-white/15" />

                        <button 
                          onClick={handleToggleFavorite}
                          className={`hover:scale-110 transition-all ${isFavorited ? 'text-red-500' : 'text-white/80 hover:text-white'}`} 
                          title="Favorite"
                        >
                          <Heart size={18} className={isFavorited ? 'fill-red-500' : ''} />
                        </button>

                        <button 
                          onClick={handleShare}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all" 
                          title="Share"
                        >
                          {shareToast ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                        </button>

                        {/* Exit button */}
                        <button
                          onClick={() => {
                            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                            setIsFullscreen(false);
                            setIsWebFullscreen(false);
                            setIsTheater(false);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 transition-colors ml-1"
                          title="Exit Fullscreen / Theater (Esc)"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* 4. GAME OVER & DYNAMIC UP NEXT RECOMMENDATION LOOP */}
          {playerState === 'game_over' && (
            <motion.div 
              key="game_over"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-4 md:p-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 font-outfit tracking-wide">
                Game Over
              </h2>
              <p className="text-gray-400 mb-6 text-xs sm:text-sm">
                Ready for your next run? Pick another challenge or jump back in:
              </p>
              
              {/* Dynamic Up Next Real Games */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 w-full max-w-2xl px-2">
                {(relatedGames && relatedGames.length > 0 ? relatedGames.slice(0, 4) : []).map((game: any) => (
                  <Link 
                    key={game.slug}
                    href={`/games/${game.slug}`}
                    className="flex flex-col bg-slate-900 border border-white/10 hover:border-[#6366F1] rounded-xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                      {game.image ? (
                        <img 
                          src={game.image} 
                          alt={game.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">
                          {game.title?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={24} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <span className="text-white font-bold text-xs truncate block group-hover:text-[#6366F1] transition-colors">
                        {game.title}
                      </span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">
                        {game.category} • ★ {Number(game.rating || 4.8).toFixed(1)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPlayerState('playing')}
                  className="px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#5457DF] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                >
                  <RotateCcw size={18} /> Play Again
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Docked Primary Control Deck (Always visible below game canvas in standard mode) */}
      {!isTheater && !isFullscreen && !isWebFullscreen && (
        <div className="w-full mt-3 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 transition-colors">
          
          {/* Left Section: Game Identity & Genre */}
          <div className="flex items-center gap-3 min-w-0">
            {image && (
              <img 
                src={image} 
                alt={title} 
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-white/10 hidden xs:block shadow-sm" 
              />
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate font-outfit">
                {title}
              </h3>
              {category && (
                <span className="text-[11px] font-semibold text-[#6366F1]">
                  {category}
                </span>
              )}
            </div>
          </div>

          {/* Right Section: Interactive Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Restart Game */}
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Restart Game (Hotkey: R)"
            >
              <RotateCcw size={16} className={isReloading ? "animate-spin text-[#6366F1]" : ""} />
              <span className="hidden sm:inline">Restart</span>
            </button>

            {/* Mute / Sound Toggle */}
            <button
              onClick={handleToggleMute}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title={isMuted ? "Unmute Sound (Hotkey: M)" : "Mute Sound (Hotkey: M)"}
            >
              {isMuted ? <VolumeX size={16} className="text-red-500" /> : <Volume2 size={16} />}
              <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
            </button>

            {/* Theater Mode Toggle (Desktop only) */}
            <button
              onClick={() => setIsTheater(!isTheater)}
              className={`hidden md:flex p-2 sm:px-3 sm:py-2 rounded-xl transition-all items-center gap-1.5 text-xs font-semibold ${
                isTheater 
                  ? "bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30" 
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
              title="Theater Mode (Hotkey: T)"
            >
              <Monitor size={16} />
              <span className="hidden lg:inline">Theater</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Fullscreen (Hotkey: F)"
            >
              <Maximize2 size={16} />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5" />

            {/* Favorite Toggle */}
            <button
              onClick={handleToggleFavorite}
              disabled={isPendingFav}
              className={`p-2 rounded-xl transition-all ${
                isFavorited 
                  ? "text-red-500 bg-red-50 dark:bg-red-500/10" 
                  : "text-gray-700 dark:text-gray-300 hover:text-red-500 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
              title={isFavorited ? "Favorited" : "Add to Favorites"}
            >
              <Heart size={16} className={isFavorited ? "fill-red-500" : ""} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              title="Share Game"
            >
              {shareToast ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            </button>

            {/* Report */}
            <button
              onClick={handleReport}
              className="p-2 rounded-xl text-gray-500 hover:text-red-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              title="Report Bug / Issue"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
