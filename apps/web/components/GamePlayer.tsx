"use client";

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Play, Maximize2, Monitor, Sun, Volume2, VolumeX, RotateCcw, Share2, Heart, Flag, Check } from 'lucide-react';
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
  const [isHovering, setIsHovering] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [rewardedAdMsgId, setRewardedAdMsgId] = useState<number | null>(null);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPendingFav, startTransition] = useTransition();
  const [shareToast, setShareToast] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRecordedRef = useRef(false);

  // Sync initialFavorited changes
  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

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
      text: `Play ${title} for free online in your browser!`,
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

  // Ad Countdown Logic
  useEffect(() => {
    if ((playerState === 'ad' || playerState === 'rewarded_ad') && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [playerState, adCountdown]);

  const skipAd = () => {
    setPlayerState('playing');
  };

  const completeRewardedAd = () => {
    setPlayerState('playing');
    if (rewardedAdMsgId !== null) {
      // Send success message to iframe
      const iframe = containerRef.current?.querySelector('iframe');
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

  // Fullscreen Logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Listen for Fullscreen changes to reset Theater mode if needed
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) setIsTheater(false);
    };
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // SDK & Game Message Communication
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


  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out flex flex-col justify-center ${
        isTheater 
          ? 'fixed inset-4 z-[100] md:inset-10 lg:inset-x-20 lg:inset-y-10' 
          : 'aspect-video min-h-[400px] md:min-h-[500px]'
      }`}
    >
      {/* Theater Mode Background Dimming (if theater is active and not fullscreen) */}
      {isTheater && !document.fullscreenElement && (
        <div 
          className="fixed inset-[-100vw] bg-black/95 z-[-1]" 
          onClick={() => setIsTheater(false)}
        />
      )}

      <AnimatePresence mode="wait">
        
        {/* 1. IDLE STATE */}
        {playerState === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 group"
          >
            {image && (
              <img 
                src={image} 
                alt={title} 
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center gap-6">
              <button 
                onClick={handlePlay}
                className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#6366F1] text-white hover:scale-110 transition-all duration-300 shadow-[0_0_40px_rgba(99,102,241,0.6)]"
              >
                <div className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-30"></div>
                <Play size={40} className="ml-2 fill-white" />
              </button>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-wide drop-shadow-xl">
                Play {title}
              </h2>
            </div>
          </motion.div>
        )}

        {/* 2. AD / LOADING STATE */}
        {playerState === 'ad' && (
          <motion.div 
            key="ad"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20"
          >
            <div className="absolute top-6 left-6 text-white/50 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              Advertisement
            </div>
            
            <div className="w-full max-w-md p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#6366F1] border-t-transparent animate-spin mb-8 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <h3 className="text-white font-bold text-xl mb-2">Loading Game Assets...</h3>
              <p className="text-gray-400 text-sm">Your game will start shortly. Support developers by watching this ad.</p>
            </div>

            <div className="absolute bottom-8 right-8">
              {adCountdown > 0 ? (
                <div className="px-6 py-3 bg-black/50 border border-white/10 text-white/70 rounded-full text-sm font-bold backdrop-blur-md">
                  Skip Ad in {adCountdown}
                </div>
              ) : (
                <button 
                  onClick={skipAd}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-200 hover:scale-105 rounded-full text-sm font-bold shadow-xl transition-all flex items-center gap-2"
                >
                  Skip Ad <Play size={14} className="fill-black" />
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
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-40 backdrop-blur-sm"
          >
            <div className="absolute top-6 left-6 text-white/50 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              Rewarded Ad
            </div>
            
            <div className="w-full max-w-md p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin mb-8 shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
              <h3 className="text-white font-bold text-xl mb-2">Watching Ad for Reward...</h3>
              <p className="text-gray-400 text-sm">Please do not close this window.</p>
            </div>

            <div className="absolute bottom-8 right-8">
              {adCountdown > 0 ? (
                <div className="px-6 py-3 bg-black/50 border border-white/10 text-white/70 rounded-full text-sm font-bold backdrop-blur-md">
                  Reward in {adCountdown}
                </div>
              ) : (
                <button 
                  onClick={completeRewardedAd}
                  className="px-6 py-3 bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all flex items-center gap-2"
                >
                  Claim Reward <Play size={14} className="fill-black" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. PLAYING STATE */}
        {playerState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-row relative z-10 bg-black rounded-2xl overflow-hidden"
          >
            
            {/* Left Skyscraper Ad (Visible on wide screens & theater mode) */}
            <div className={`hidden ${isTheater ? 'xl:flex' : '2xl:flex'} flex-col justify-center items-center px-4 bg-gray-900 border-r border-white/5 z-20`}>
                <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
            </div>

            {/* Game Canvas */}
            <div className="flex-1 h-full relative flex justify-center items-center pointer-events-auto z-10 min-w-0">
              {sourceUrl ? (
                <iframe 
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
            <div className={`hidden ${isTheater ? 'xl:flex' : '2xl:flex'} flex-col justify-center items-center px-4 bg-gray-900 border-l border-white/5 z-20`}>
                <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
            </div>

            {/* Share Toast Notification */}
            <AnimatePresence>
              {shareToast && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/30"
                >
                  <Check size={14} className="text-white stroke-[3]" /> Link copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Universal Floating Action Bar */}
            <AnimatePresence>
              {(isHovering || isTheater) && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50"
                >
                  <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-6 shadow-2xl pointer-events-auto">
                    
                    <button 
                      onClick={handleToggleFavorite}
                      disabled={isPendingFav}
                      className={`hover:scale-110 transition-all ${isFavorited ? 'text-red-500 hover:text-red-400' : 'text-white/70 hover:text-white'}`} 
                      title={isFavorited ? "Favorited" : "Add to Favorites"}
                    >
                      <Heart size={20} className={isFavorited ? 'fill-red-500' : ''} />
                    </button>
                    
                    <button 
                      onClick={handleShare}
                      className="text-white/70 hover:text-white hover:scale-110 transition-all relative" 
                      title="Share Game"
                    >
                      {shareToast ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                    </button>
                    
                    <div className="w-px h-6 bg-white/10" />

                    <button 
                      onClick={() => setIsTheater(!isTheater)}
                      className={`transition-all hover:scale-110 ${isTheater ? 'text-[#6366F1]' : 'text-white/70 hover:text-white'}`}
                      title={isTheater ? "Exit Theater Mode" : "Theater Mode"}
                    >
                      <Monitor size={20} />
                    </button>

                    <button 
                      onClick={toggleFullscreen}
                      className="text-white/70 hover:text-white hover:scale-110 transition-all"
                      title="Fullscreen"
                    >
                      <Maximize2 size={20} />
                    </button>
                    
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white/70 hover:text-white hover:scale-110 transition-all"
                      title="Toggle Sound"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>

                    <div className="w-px h-6 bg-white/10" />

                    <button 
                      onClick={handleReport}
                      className="text-white/70 hover:text-red-400 hover:scale-110 transition-all" 
                      title="Report Bug / Issue"
                    >
                      <Flag size={20} />
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 4. GAME OVER / UP NEXT STATE */}
        {playerState === 'game_over' && (
          <motion.div 
            key="game_over"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-4 md:p-8"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 font-outfit">Game Over</h2>
            <p className="text-gray-400 mb-6 text-sm md:text-base">Ready for your next challenge? Choose a game below:</p>
            
            {/* Dynamic Up Next Real Games */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 w-full max-w-2xl px-2">
              {(relatedGames && relatedGames.length > 0 ? relatedGames.slice(0, 4) : []).map((game: any) => (
                <Link 
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="flex flex-col bg-slate-900 border border-white/10 hover:border-indigo-500 rounded-xl overflow-hidden group transition-all hover:scale-105"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                    {game.image ? (
                      <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">
                        {game.title?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play size={24} className="text-white fill-white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <span className="text-white font-bold text-xs truncate block group-hover:text-indigo-400 transition-colors">{game.title}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">{game.category} • ★ {Number(game.rating || 4.8).toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPlayerState('playing')}
                className="px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#5457DF] hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              >
                <RotateCcw size={18} /> Play Again
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
