"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition } from 'react';
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
  Gamepad2,
  Cloud,
  CloudOff,
  Loader2,
  LayoutTemplate,
  Camera,
  HelpCircle,
  MoreHorizontal,
  Timer,
  Trophy,
  PictureInPicture2,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecentGames } from '@/hooks/useRecentGames';
import { saveGameState, loadGameState } from '@/app/games/actions';
import { toggleFavoriteGame } from '@/app/profile/actions';
import AdBanner from '@/components/AdBanner';

type PlayerState = 'idle' | 'ad' | 'rewarded_ad' | 'playing' | 'game_over';
type AspectRatio = '16:9' | '4:3' | '9:16' | 'auto';
type CloudSaveStatus = 'idle' | 'saving' | 'saved' | 'loading' | 'loaded' | 'error';

const VPAD_KEYS: Record<string, string> = {
  up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
  a: 'x', b: 'z', x: 'c', y: 'v',
};

const AR_CLASSES: Record<AspectRatio, string> = {
  '16:9': 'aspect-video min-h-[260px] sm:min-h-[380px] md:min-h-[480px] xl:min-h-[560px]',
  '4:3': 'aspect-[4/3] min-h-[240px] sm:min-h-[360px]',
  '9:16': 'aspect-[9/16] max-w-[360px] mx-auto min-h-[480px]',
  'auto': 'min-h-[300px] sm:min-h-[420px] md:min-h-[540px] xl:min-h-[620px]',
};

const SHORTCUTS = [
  { key: 'F', label: 'Fullscreen' },
  { key: 'T', label: 'Theater Mode' },
  { key: 'M', label: 'Mute / Unmute' },
  { key: 'R', label: 'Restart Game' },
  { key: 'Esc', label: 'Exit Mode' },
  { key: '?', label: 'Show Shortcuts' },
];

const fmtTime = (s: number) =>
  String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

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
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [rewardedAdMsgId, setRewardedAdMsgId] = useState<number | null>(null);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPendingFav, startTransition] = useTransition();
  const [shareToast, setShareToast] = useState(false);
  const [showHud, setShowHud] = useState(true);

  // Feature 1: Iframe Loading Buffer
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const iframeLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Feature 2: Virtual Gamepad
  const [showVirtualPad, setShowVirtualPad] = useState(false);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  // Feature 3: Cloud Save
  const [cloudSaveStatus, setCloudSaveStatus] = useState<CloudSaveStatus>('idle');
  const cloudSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Feature 4: Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [showArMenu, setShowArMenu] = useState(false);

  // Feature 5: Ambient Glow
  const ambientColor = useRef<string>('#6366F1');

  // Improvement 1: Session Timer
  const [sessionTime, setSessionTime] = useState(0);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Improvement 2: Score Toast
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [showScoreToast, setShowScoreToast] = useState(false);
  const scoreToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Improvement 3: PiP
  const [isPip, setIsPip] = useState(false);
  const pipWindowRef = useRef<Window | null>(null);
  const [hasPipSupport] = useState(() => typeof window !== 'undefined' && 'documentPictureInPicture' in window);

  // Improvement 4: Swipe
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);

  // Improvement 5: Shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false);
  const shortcutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Improvement 6: Screenshot
  const [screenshotToast, setScreenshotToast] = useState<'success' | 'hint' | null>(null);

  // Improvement 7: Overflow menu
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const overflowMenuRef = useRef<HTMLDivElement>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasRecordedRef = useRef(false);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Ambient color from category
  useEffect(() => {
    const map: Record<string, string> = {
      action: '#EF4444', adventure: '#F59E0B', puzzle: '#8B5CF6',
      racing: '#F97316', sports: '#10B981', shooting: '#EF4444',
      strategy: '#3B82F6', arcade: '#EC4899', rpg: '#A855F7',
      horror: '#6B7280', simulation: '#14B8A6', platform: '#F59E0B',
    };
    const key = (category || '').toLowerCase();
    const match = Object.keys(map).find(k => key.includes(k));
    ambientColor.current = match ? map[match] : '#6366F1';
  }, [category]);

  // Cloud status helper
  const setCloudStatus = useCallback((status: CloudSaveStatus) => {
    setCloudSaveStatus(status);
    if (cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
    if (status === 'saved' || status === 'loaded' || status === 'error') {
      cloudSaveTimerRef.current = setTimeout(() => setCloudSaveStatus('idle'), 3000);
    }
  }, []);

  // Improvement 1: Session timer
  useEffect(() => {
    if (playerState === 'playing') {
      sessionIntervalRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    } else {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    }
    return () => { if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current); };
  }, [playerState]);

  // Improvement 8: visibilitychange
  useEffect(() => {
    if (playerState !== 'playing') return;
    const handle = async () => {
      const iframe = iframeRef.current;
      if (document.hidden) {
        iframe?.contentWindow?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'PAGE_HIDDEN' }, '*');
        if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; }
      } else {
        iframe?.contentWindow?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'PAGE_VISIBLE' }, '*');
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
          try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen'); } catch (e) {}
        }
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [playerState]);

  // Improvement 7: click-outside for overflow menu
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => { setIsFavorited(initialFavorited); }, [initialFavorited]);

  // WakeLock
  useEffect(() => {
    const acquire = async () => {
      if (playerState === 'playing' && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen'); } catch (err) {}
      } else if (playerState !== 'playing' && wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
    acquire();
    return () => { if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; } };
  }, [playerState]);

  // Body scroll lock
  useEffect(() => {
    if (isTheater || isWebFullscreen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = orig; };
    }
  }, [isTheater, isWebFullscreen]);

  // HUD timer
  const resetHudTimer = () => {
    setShowHud(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    if (isTheater || isFullscreen || isWebFullscreen) {
      hudTimerRef.current = setTimeout(() => setShowHud(false), 3200);
    }
  };

  useEffect(() => {
    if (isTheater || isFullscreen || isWebFullscreen) resetHudTimer();
    else { setShowHud(true); if (hudTimerRef.current) clearTimeout(hudTimerRef.current); }
  }, [isTheater, isFullscreen, isWebFullscreen]);

  const handlePlay = () => { setPlayerState('ad'); addRecentGame({ slug, title, image }); };

  useEffect(() => {
    if (slug && !hasRecordedRef.current) { hasRecordedRef.current = true; addRecentGame({ slug, title, image }); }
  }, [slug, title, image, addRecentGame]);

  useEffect(() => {
    if ((playerState === 'ad' || playerState === 'rewarded_ad') && adCountdown > 0) {
      const t = setTimeout(() => setAdCountdown(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [playerState, adCountdown]);

  const skipAd = () => {
    setIsIframeLoading(true);
    setPlayerState('playing');
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    iframeLoadTimeoutRef.current = setTimeout(() => setIsIframeLoading(false), 12000);
    setTimeout(() => { iframeRef.current?.focus(); }, 100);
  };

  const handleIframeLoad = () => {
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    setTimeout(() => setIsIframeLoading(false), 800);
  };

  const completeRewardedAd = () => {
    setPlayerState('playing');
    if (rewardedAdMsgId !== null) {
      const iframe = iframeRef.current || containerRef.current?.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'REWARDED_AD_COMPLETE', payload: { success: true }, msgId: rewardedAdMsgId }, '*');
      }
      setRewardedAdMsgId(null);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    const iframe = iframeRef.current || containerRef.current?.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'SET_MUTE', isMuted: next, mute: next }, '*');
      iframe.contentWindow.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'MUTE', payload: { isMuted: next } }, '*');
      iframe.contentWindow.postMessage(JSON.stringify({ action: next ? 'mute' : 'unmute' }), '*');
    }
  };

  const handleReload = () => {
    setIsReloading(true);
    setIsIframeLoading(true);
    setSessionTime(0);
    setReloadKey(p => p + 1);
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    iframeLoadTimeoutRef.current = setTimeout(() => setIsIframeLoading(false), 12000);
    setTimeout(() => { setIsReloading(false); iframeRef.current?.focus(); }, 600);
  };

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
          setIsFullscreen(true); setIsTheater(false);
          if (screen.orientation && (screen.orientation as any).lock) (screen.orientation as any).lock('landscape').catch(() => {});
        } else { setIsWebFullscreen(true); setIsTheater(false); }
      } catch { setIsWebFullscreen(true); setIsTheater(false); }
    }
  };

  useEffect(() => {
    const h = () => { const a = !!document.fullscreenElement; setIsFullscreen(a); if (a) setIsTheater(false); };
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  // Keyboard hotkeys + Improvement 5
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (playerState !== 'playing') return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        if (containerRef.current?.contains(document.activeElement) || document.activeElement === document.body) e.preventDefault();
      }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 't' || e.key === 'T') { e.preventDefault(); setIsTheater(p => !p); }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); handleToggleMute(); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); handleReload(); }
      else if (e.key === 'Escape') {
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (isTheater) setIsTheater(false);
        if (isWebFullscreen) setIsWebFullscreen(false);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(p => !p);
        if (shortcutTimerRef.current) clearTimeout(shortcutTimerRef.current);
        shortcutTimerRef.current = setTimeout(() => setShowShortcuts(false), 5000);
      }
    };
    window.addEventListener('keydown', handle, { passive: false });
    return () => window.removeEventListener('keydown', handle);
  }, [playerState, isTheater, isWebFullscreen, isMuted, showShortcuts]);

  // SDK messages
  useEffect(() => {
    if (playerState !== 'playing' || !sourceUrl) return;
    const handle = async (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.source === 'SPIELCADE_SDK') {
        switch (event.data.type) {
          case 'SUBMIT_SCORE': {
            const score = Number(event.data.payload?.score ?? 0);
            if (score > 0) {
              setLiveScore(score); setShowScoreToast(true);
              if (scoreToastTimerRef.current) clearTimeout(scoreToastTimerRef.current);
              scoreToastTimerRef.current = setTimeout(() => setShowScoreToast(false), 2500);
            }
            if (onGameOver && score > 0) onGameOver(score);
            break;
          }
          case 'GAME_OVER': setPlayerState('game_over'); break;
          case 'SHOW_REWARDED_AD': setAdCountdown(5); setRewardedAdMsgId(event.data.msgId); setPlayerState('rewarded_ad'); break;
          case 'SAVE_DATA': {
            setCloudStatus('saving');
            const res = await saveGameState(slug, event.data.payload.data);
            event.source?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'SAVE_DATA_RESPONSE', payload: res, msgId: event.data.msgId }, { targetOrigin: '*' });
            setCloudStatus(res ? 'saved' : 'error');
            break;
          }
          case 'LOAD_DATA': {
            setCloudStatus('loading');
            const res = await loadGameState(slug);
            event.source?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'LOAD_DATA_RESPONSE', payload: res, msgId: event.data.msgId }, { targetOrigin: '*' });
            setCloudStatus(res ? 'loaded' : 'error');
            break;
          }
        }
      }
      try {
        const raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (raw && (raw.type === 'score' || raw.type === 'gameover' || raw.action === 'game_over' || raw.event === 'gameover' || raw.name === 'gameOver')) {
          const score = Number(raw.score || raw.points || raw.value || raw.finalScore || 0);
          if (score > 0) {
            setLiveScore(score); setShowScoreToast(true);
            if (scoreToastTimerRef.current) clearTimeout(scoreToastTimerRef.current);
            scoreToastTimerRef.current = setTimeout(() => setShowScoreToast(false), 2500);
            if (onGameOver) onGameOver(score);
          }
        }
      } catch {}
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [playerState, sourceUrl, onGameOver, slug, setCloudStatus]);

  // Cleanup
  useEffect(() => () => {
    [iframeLoadTimeoutRef, cloudSaveTimerRef, hudTimerRef, scoreToastTimerRef, shortcutTimerRef]
      .forEach(r => { if (r.current) clearTimeout(r.current); });
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
  }, []);

  // Virtual gamepad
  const dispatchVirtualKey = useCallback((key: string, type: 'keydown' | 'keyup') => {
    const iframe = iframeRef.current;
    const tgt = (iframe?.contentDocument || document) as any;
    const codes: Record<string,string> = { ArrowUp:'ArrowUp', ArrowDown:'ArrowDown', ArrowLeft:'ArrowLeft', ArrowRight:'ArrowRight' };
    tgt.dispatchEvent(new KeyboardEvent(type, { key, code: codes[key] || 'Key'+key.toUpperCase(), bubbles: true, cancelable: true }));
    iframe?.contentWindow?.postMessage({ source: 'SPIELCADE_WRAPPER', type: type === 'keydown' ? 'KEY_DOWN' : 'KEY_UP', key }, '*');
  }, []);

  const handleVpadPress = useCallback((action: string) => {
    const key = VPAD_KEYS[action];
    if (!key || pressedKeysRef.current.has(key)) return;
    pressedKeysRef.current.add(key); dispatchVirtualKey(key, 'keydown');
  }, [dispatchVirtualKey]);

  const handleVpadRelease = useCallback((action: string) => {
    const key = VPAD_KEYS[action]; if (!key) return;
    pressedKeysRef.current.delete(key); dispatchVirtualKey(key, 'keyup');
  }, [dispatchVirtualKey]);

  const vpadProps = (action: string) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); handleVpadPress(action); },
    onPointerUp: (e: React.PointerEvent) => { e.preventDefault(); handleVpadRelease(action); },
    onPointerLeave: () => handleVpadRelease(action),
  });

  // Improvement 4: Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    resetHudTimer();
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartYRef.current;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(dy) <= Math.abs(dx)) return;
    if (dy > 80 && (isTheater || isFullscreen || isWebFullscreen)) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false); setIsWebFullscreen(false); setIsTheater(false);
    } else if (dy < -80 && !isTheater && !isFullscreen && !isWebFullscreen) {
      setIsTheater(true);
    }
  };

  // Improvement 6: Screenshot
  const handleScreenshot = async () => {
    const iframe = iframeRef.current;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = iframe?.clientWidth || 800;
      canvas.height = iframe?.clientHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx || !iframe) throw new Error('no ctx');
      ctx.drawImage(iframe as any, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = slug+'-'+Date.now()+'.png'; a.click();
        URL.revokeObjectURL(url);
      });
      setScreenshotToast('success');
    } catch { setScreenshotToast('hint'); }
    setTimeout(() => setScreenshotToast(null), 2500);
  };

  // Improvement 3: PiP
  const handlePip = async () => {
    if (!(window as any).documentPictureInPicture) return;
    if (isPip && pipWindowRef.current) { pipWindowRef.current.close(); return; }
    try {
      const pipWin: Window = await (window as any).documentPictureInPicture.requestWindow({ width: 480, height: 270 });
      pipWindowRef.current = pipWin; setIsPip(true);
      pipWin.document.body.style.cssText = 'margin:0;background:#000;display:flex;align-items:center;justify-content:center;width:100%;height:100%';
      if (iframeRef.current) pipWin.document.body.appendChild(iframeRef.current);
      pipWin.addEventListener('pagehide', () => {
        const vp = containerRef.current?.querySelector('.pip-viewport');
        if (iframeRef.current && vp) vp.appendChild(iframeRef.current);
        setIsPip(false); pipWindowRef.current = null;
      });
    } catch { setIsPip(false); }
  };

  const handleToggleFavorite = () => {
    if (!gameId) { alert('Please sign in to add games to your favorites!'); return; }
    const next = !isFavorited; setIsFavorited(next);
    startTransition(async () => {
      const res = await toggleFavoriteGame(gameId);
      if (!res.success) { setIsFavorited(!next); if (res.error === 'Unauthorized') alert('You must be logged in to favorite games!'); }
    });
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const data = { title: 'Play '+title+' Unblocked | Spielcade', text: 'Play '+title+' free online — no downloads!', url };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(data); return; } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); setShareToast(true); setTimeout(() => setShareToast(false), 2500); } catch {}
    }
  };

  const handleReport = () => window.open('/contact?subject=Report%20Game%20Issue&game='+encodeURIComponent(slug), '_blank');

  const isExpandedMode = isTheater || isFullscreen || isWebFullscreen;

  return (
    <div className="w-full flex flex-col select-none relative">

      {playerState === 'playing' && (
        <div aria-hidden="true" className="pointer-events-none absolute -inset-6 rounded-3xl opacity-25 blur-3xl transition-opacity duration-1000 z-0"
          style={{ background: 'radial-gradient(ellipse at center, '+ambientColor.current+'60 0%, transparent 70%)', willChange: 'opacity' }} />
      )}

      <div ref={containerRef} onMouseMove={resetHudTimer} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
        className={'relative w-full bg-black overflow-hidden shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-center touch-manipulation '+(
          isWebFullscreen ? 'fixed inset-0 z-[1000] w-screen h-screen rounded-none'
            : isTheater ? 'fixed inset-2 md:inset-6 lg:inset-10 z-[100] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10'
            : AR_CLASSES[aspectRatio]+' w-full rounded-2xl border border-gray-200 dark:border-white/10'
        )}
      >
        {isExpandedMode && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-10 h-1 rounded-full bg-white/20 pointer-events-none" />}
        {isTheater && !document.fullscreenElement && (
          <div className="fixed inset-0 bg-black/95 z-[-1] backdrop-blur-md" onClick={() => setIsTheater(false)} />
        )}

        <AnimatePresence mode="wait">

          {playerState === 'idle' && (
            <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 group cursor-pointer" onClick={handlePlay}
            >
              {image && <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" />}
              <div className="relative z-10 flex flex-col items-center gap-5 p-4 text-center">
                <button onClick={e=>{e.stopPropagation();handlePlay();}} aria-label={'Play '+title}
                  className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#6366F1] text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_50px_rgba(99,102,241,0.7)]">
                  <div className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-30" />
                  <Play size={40} className="ml-2 fill-white" />
                </button>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide drop-shadow-xl font-outfit">Play {title}</h2>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium">Free Instant Play • No Downloads • Unblocked</p>
                </div>
              </div>
            </motion.div>
          )}

          {playerState === 'ad' && (
            <motion.div key="ad" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20 p-6">
              <div className="absolute top-6 left-6 text-white/60 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />Loading Game Assets
              </div>
              <div className="w-full max-w-md p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-[#6366F1] border-t-transparent animate-spin mb-6 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                <h3 className="text-white font-bold text-lg sm:text-xl mb-2 font-outfit">Starting {title}...</h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-xs">Your game is initializing. Support independent game creators by viewing sponsor announcements.</p>
              </div>
              <div className="absolute bottom-6 right-6">
                {adCountdown > 0
                  ? <div className="px-5 py-2.5 bg-black/60 border border-white/10 text-white/70 rounded-full text-xs font-bold backdrop-blur-md">Skip Ad in {adCountdown}s</div>
                  : <button onClick={skipAd} className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 rounded-full text-xs sm:text-sm font-bold shadow-2xl transition-all flex items-center gap-2">Play Now <Play size={14} className="fill-black" /></button>
                }
              </div>
            </motion.div>
          )}

          {playerState === 'rewarded_ad' && (
            <motion.div key="rewarded_ad" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-40 backdrop-blur-sm p-6">
              <div className="absolute top-6 left-6 text-white/60 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />Rewarded Sponsor
              </div>
              <div className="w-full max-w-md p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mb-6 shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                <h3 className="text-white font-bold text-lg sm:text-xl mb-2 font-outfit">Claiming In-Game Reward...</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Please do not close this window while the reward verifies.</p>
              </div>
              <div className="absolute bottom-6 right-6">
                {adCountdown > 0
                  ? <div className="px-5 py-2.5 bg-black/60 border border-white/10 text-white/70 rounded-full text-xs font-bold backdrop-blur-md">Reward in {adCountdown}s</div>
                  : <button onClick={completeRewardedAd} className="px-6 py-2.5 bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 active:scale-95 rounded-full text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all flex items-center gap-2">Claim Reward <Play size={14} className="fill-black" /></button>
                }
              </div>
            </motion.div>
          )}

          {playerState === 'playing' && (
            <motion.div key="playing" initial={{opacity:0}} animate={{opacity:1}} className="w-full h-full flex flex-row relative z-10 bg-black overflow-hidden">
              <div className={'hidden '+(isTheater?'xl:flex':'2xl:flex')+' flex-col justify-center items-center px-3 bg-gray-950 border-r border-white/5 z-20 shrink-0'}>
                <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
              </div>

              <div className="pip-viewport flex-1 h-full relative flex justify-center items-center pointer-events-auto z-10 min-w-0">
                {sourceUrl ? (
                  <>
                    <iframe key={reloadKey} ref={iframeRef} src={sourceUrl} onLoad={handleIframeLoad}
                      className="absolute inset-0 w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-modals"
                      allow="fullscreen; autoplay; gamepad; focus-without-user-activation; accelerometer; gyroscope; clipboard-write"
                      title={title} />
                    <AnimatePresence>
                      {isIframeLoading && (
                        <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950">
                          {image && <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110" />}
                          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
                            <div className="relative w-20 h-20">
                              <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                                style={{borderColor: ambientColor.current+' transparent transparent transparent'}} />
                              <div className="absolute inset-2 rounded-full border-2 border-white/10 animate-pulse" />
                              {image ? <img src={image} alt="" className="absolute inset-3 rounded-full object-cover" />
                                : <div className="absolute inset-3 rounded-full bg-white/10 flex items-center justify-center"><Loader2 size={20} className="text-white/60 animate-spin" /></div>}
                            </div>
                            <div>
                              <p className="text-white font-bold text-base sm:text-lg font-outfit">Loading {title}</p>
                              <p className="text-gray-400 text-xs mt-1">Initializing game engine...</p>
                            </div>
                            <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full w-full rounded-full opacity-80"
                                style={{background:'linear-gradient(90deg,transparent 0%,'+ambientColor.current+' 50%,transparent 100%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s ease-in-out infinite'}} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : children}
              </div>

              <div className={'hidden '+(isTheater?'xl:flex':'2xl:flex')+' flex-col justify-center items-center px-3 bg-gray-950 border-l border-white/5 z-20 shrink-0'}>
                <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
              </div>

              {/* Share Toast */}
              <AnimatePresence>
                {shareToast && (
                  <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/30">
                    <Check size={14} className="stroke-[3]" /> Link copied!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Score Toast */}
              <AnimatePresence>
                {showScoreToast && liveScore !== null && (
                  <motion.div key="score" initial={{opacity:0,scale:0.8,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.8,y:-20}}
                    transition={{type:'spring',stiffness:400,damping:20}}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 z-[70] pointer-events-none">
                    <div className="bg-black/90 border border-yellow-400/40 text-yellow-300 px-6 py-3 rounded-2xl text-lg font-black backdrop-blur-md shadow-2xl flex items-center gap-3">
                      <Trophy size={20} className="text-yellow-400" />
                      <span>+{liveScore.toLocaleString()} pts</span>
                      <Zap size={16} className="text-yellow-300" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Screenshot Toast */}
              <AnimatePresence>
                {screenshotToast && (
                  <motion.div key="sshot" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
                    className={'absolute top-6 right-4 z-[70] px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 '+(screenshotToast==='success'?'bg-emerald-600 text-white border border-emerald-400/30':'bg-gray-800 text-gray-200 border border-white/10')}>
                    <Camera size={13} />
                    {screenshotToast === 'success' ? 'Screenshot saved!' : 'Use PrtScn or device screenshot'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cloud Save Pill */}
              <AnimatePresence>
                {cloudSaveStatus !== 'idle' && (
                  <motion.div key="cloud" initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.25}}
                    className={'absolute top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none '+(
                      cloudSaveStatus==='error'?'bg-red-900/80 border-red-500/30 text-red-300'
                        :cloudSaveStatus==='saving'||cloudSaveStatus==='loading'?'bg-blue-900/80 border-blue-500/30 text-blue-200'
                        :'bg-emerald-900/80 border-emerald-500/30 text-emerald-200')}>
                    {(cloudSaveStatus==='saving'||cloudSaveStatus==='loading') && <Loader2 size={12} className="animate-spin" />}
                    {cloudSaveStatus==='saving'&&'💾 Saving...'}{cloudSaveStatus==='saved'&&'☁️ Cloud Save Synced'}
                    {cloudSaveStatus==='loading'&&'☁️ Loading Save...'}{cloudSaveStatus==='loaded'&&'☁️ Save Loaded'}
                    {cloudSaveStatus==='error'&&'⚠️ Save Error'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shortcut Modal */}
              <AnimatePresence>
                {showShortcuts && (
                  <motion.div key="shortcuts" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:0.2}}
                    className="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={()=>setShowShortcuts(false)}>
                    <div className="bg-[#111228] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-xs w-full mx-4" onClick={e=>e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-sm font-outfit flex items-center gap-2">
                          <HelpCircle size={16} className="text-[#6366F1]" /> Keyboard Shortcuts
                        </h3>
                        <button onClick={()=>setShowShortcuts(false)} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {SHORTCUTS.map(({key,label})=>(
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">{label}</span>
                            <kbd className="px-2 py-1 bg-white/10 border border-white/15 rounded-md text-white text-xs font-mono font-bold">{key}</kbd>
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-500 text-[11px] text-center mt-4">Auto-closes in 5s • Press ? to toggle</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Virtual Gamepad */}
              <AnimatePresence>
                {showVirtualPad && (
                  <motion.div key="vpad" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} transition={{duration:0.2}}
                    className="absolute bottom-4 left-0 right-0 z-40 flex justify-between items-end px-4 pointer-events-none">
                    <div className="pointer-events-auto relative w-[128px] h-[128px] select-none">
                      <button {...vpadProps('up')} className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-black/75 border border-white/25 rounded-xl flex items-center justify-center text-white active:bg-white/20 touch-none shadow-lg" aria-label="Up">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5m0 0-7 7m7-7 7 7"/></svg>
                      </button>
                      <button {...vpadProps('down')} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-black/75 border border-white/25 rounded-xl flex items-center justify-center text-white active:bg-white/20 touch-none shadow-lg" aria-label="Down">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14m0 0 7-7m-7 7-7-7"/></svg>
                      </button>
                      <button {...vpadProps('left')} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/75 border border-white/25 rounded-xl flex items-center justify-center text-white active:bg-white/20 touch-none shadow-lg" aria-label="Left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5m0 0 7 7M5 12l7-7"/></svg>
                      </button>
                      <button {...vpadProps('right')} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/75 border border-white/25 rounded-xl flex items-center justify-center text-white active:bg-white/20 touch-none shadow-lg" aria-label="Right">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m0 0-7-7m7 7-7 7"/></svg>
                      </button>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 rounded-full bg-white/10 border border-white/15" />
                      </div>
                    </div>
                    <div className="pointer-events-auto relative w-[128px] h-[128px] select-none">
                      <button {...vpadProps('a')} className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 bg-green-600/85 border border-green-400/40 rounded-full flex items-center justify-center text-white text-sm font-black active:scale-90 touch-none shadow-lg" aria-label="A">A</button>
                      <button {...vpadProps('b')} className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-red-600/85 border border-red-400/40 rounded-full flex items-center justify-center text-white text-sm font-black active:scale-90 touch-none shadow-lg" aria-label="B">B</button>
                      <button {...vpadProps('x')} className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-blue-600/85 border border-blue-400/40 rounded-full flex items-center justify-center text-white text-sm font-black active:scale-90 touch-none shadow-lg" aria-label="X">X</button>
                      <button {...vpadProps('y')} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 bg-yellow-500/85 border border-yellow-400/40 rounded-full flex items-center justify-center text-white text-sm font-black active:scale-90 touch-none shadow-lg" aria-label="Y">Y</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auto-hiding HUD */}
              {isExpandedMode && (
                <AnimatePresence>
                  {showHud && (
                    <motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} exit={{y:50,opacity:0}} transition={{duration:0.2}}
                      className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50 px-4">
                      <div className="bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-2.5 flex items-center gap-4 sm:gap-6 shadow-2xl pointer-events-auto">
                        <span className="text-xs font-bold text-white max-w-[120px] sm:max-w-xs truncate font-outfit">{title}</span>
                        {sessionTime > 0 && <span className="text-[10px] text-white/50 font-mono hidden sm:inline">{fmtTime(sessionTime)}</span>}
                        <div className="w-px h-5 bg-white/15" />
                        <button onClick={handleReload} className="text-white/80 hover:text-white hover:scale-110 transition-all" title="Restart (R)">
                          <RotateCcw size={18} className={isReloading ? 'animate-spin text-[#6366F1]' : ''} />
                        </button>
                        <button onClick={handleToggleMute} className="text-white/80 hover:text-white hover:scale-110 transition-all" title={isMuted?'Unmute (M)':'Mute (M)'}>
                          {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
                        </button>
                        {isTheater && <button onClick={()=>setIsTheater(false)} className="text-[#6366F1] hover:text-white hover:scale-110 transition-all" title="Exit Theater (T)"><MonitorX size={18} /></button>}
                        <button onClick={toggleFullscreen} className="text-white/80 hover:text-white hover:scale-110 transition-all" title={isFullscreen||isWebFullscreen?'Exit Fullscreen (F)':'Fullscreen (F)'}>
                          {isFullscreen||isWebFullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
                        </button>
                        <div className="w-px h-5 bg-white/15" />
                        <button onClick={handleToggleFavorite} className={'hover:scale-110 transition-all '+(isFavorited?'text-red-500':'text-white/80 hover:text-white')} title="Favorite">
                          <Heart size={18} className={isFavorited?'fill-red-500':''} />
                        </button>
                        <button onClick={handleShare} className="text-white/80 hover:text-white hover:scale-110 transition-all" title="Share">
                          {shareToast ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                        </button>
                        <button onClick={()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});setIsFullscreen(false);setIsWebFullscreen(false);setIsTheater(false);}}
                          className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 transition-colors ml-1" title="Exit (Esc)">
                          <X size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {playerState === 'game_over' && (
            <motion.div key="game_over" initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-4 md:p-8">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-1 font-outfit tracking-wide">Game Over</h2>
              {liveScore !== null && liveScore > 0 && (
                <div className="flex items-center gap-2 mb-3 px-5 py-2 bg-yellow-500/10 border border-yellow-400/20 rounded-xl">
                  <Trophy size={18} className="text-yellow-400" />
                  <span className="text-yellow-300 font-black text-xl">{liveScore.toLocaleString()}</span>
                  <span className="text-yellow-400/60 text-xs font-semibold">pts</span>
                </div>
              )}
              {sessionTime > 0 && (
                <div className="flex items-center gap-1.5 mb-4 text-gray-500 text-xs">
                  <Timer size={12} /><span>Played for {fmtTime(sessionTime)}</span>
                </div>
              )}
              <p className="text-gray-400 mb-5 text-xs sm:text-sm">Ready for your next run? Pick another challenge or jump back in:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 w-full max-w-2xl px-2">
                {(relatedGames && relatedGames.length > 0 ? relatedGames.slice(0,4) : []).map((game: any) => (
                  <Link key={game.slug} href={'/games/'+game.slug}
                    className="flex flex-col bg-slate-900 border border-white/10 hover:border-[#6366F1] rounded-xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                      {game.image
                        ? <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">{game.title?.substring(0,2).toUpperCase()}</div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={24} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <span className="text-white font-bold text-xs truncate block group-hover:text-[#6366F1] transition-colors">{game.title}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{game.category} • ★ {Number(game.rating||4.8).toFixed(1)}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={()=>{setPlayerState('playing');setSessionTime(0);}}
                  className="px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#5457DF] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.5)]">
                  <RotateCcw size={18} /> Play Again
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Control Deck */}
      {!isTheater && !isFullscreen && !isWebFullscreen && (
        <div className="w-full mt-3 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 transition-colors">

          {/* Left: Identity + Timer */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {image && <img src={image} alt={title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-white/10 hidden xs:block shadow-sm" />}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate font-outfit">{title}</h3>
              <div className="flex items-center gap-2">
                {category && <span className="text-[11px] font-semibold text-[#6366F1]">{category}</span>}
                {playerState === 'playing' && sessionTime > 0 && (
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1">
                    <Timer size={10} /> {fmtTime(sessionTime)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Tiered Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

            {/* Tier 1: Always — Restart, Mute, Fullscreen */}
            <button onClick={handleReload} disabled={isReloading}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Restart (R)">
              <RotateCcw size={15} className={isReloading ? 'animate-spin text-[#6366F1]' : ''} />
              <span className="hidden xl:inline">Restart</span>
            </button>

            <button onClick={handleToggleMute}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
              {isMuted ? <VolumeX size={15} className="text-red-500" /> : <Volume2 size={15} />}
              <span className="hidden xl:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button onClick={toggleFullscreen}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Fullscreen (F)">
              <Maximize2 size={15} />
              <span className="hidden xl:inline">Fullscreen</span>
            </button>

            {/* Tier 2: sm+ — Gamepad, AR, Theater */}
            {playerState === 'playing' && (
              <button onClick={()=>setShowVirtualPad(p=>!p)}
                className={'hidden sm:flex p-2 rounded-xl transition-all items-center gap-1.5 text-xs font-semibold '+(showVirtualPad?'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30':'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10')}
                title="Virtual Gamepad">
                <Gamepad2 size={15} />
              </button>
            )}

            <div className="hidden sm:block relative">
              <button onClick={()=>setShowArMenu(p=>!p)}
                className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Aspect Ratio">
                <LayoutTemplate size={15} />
              </button>
              <AnimatePresence>
                {showArMenu && (
                  <motion.div initial={{opacity:0,scale:0.92,y:4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:4}} transition={{duration:0.15}}
                    className="absolute bottom-full mb-2 right-0 z-50 bg-white dark:bg-[#1a1b38] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[138px]">
                    {(['16:9','4:3','9:16','auto'] as AspectRatio[]).map(ar => (
                      <button key={ar} onClick={()=>{setAspectRatio(ar);setShowArMenu(false);}}
                        className={'w-full text-left px-3 py-2.5 text-xs font-semibold flex items-center gap-2 transition-colors '+(aspectRatio===ar?'bg-[#6366F1] text-white':'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5')}>
                        {aspectRatio===ar ? <Check size={11}/> : <span className="w-[11px]"/>}
                        <span>{ar==='auto'?'Auto':ar}</span>
                        <span className="ml-auto text-[10px] opacity-60">{ar==='16:9'?'Standard':ar==='4:3'?'Retro':ar==='9:16'?'Vertical':'Fill'}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={()=>setIsTheater(!isTheater)}
              className={'hidden md:flex p-2 rounded-xl transition-all items-center gap-1.5 text-xs font-semibold '+(isTheater?'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30':'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10')}
              title="Theater Mode (T)">
              <Monitor size={15} />
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

            {/* Tier 3: md+ icon buttons — PiP, Screenshot, Shortcuts */}
            {hasPipSupport && playerState === 'playing' && (
              <button onClick={handlePip}
                className={'hidden md:flex p-2 rounded-xl transition-all '+(isPip?'bg-[#6366F1] text-white':'text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10')}
                title="Picture in Picture">
                <PictureInPicture2 size={15} />
              </button>
            )}

            {playerState === 'playing' && (
              <button onClick={handleScreenshot}
                className="hidden md:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                title="Screenshot">
                <Camera size={15} />
              </button>
            )}

            {playerState === 'playing' && (
              <button onClick={()=>setShowShortcuts(p=>!p)}
                className="hidden md:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                title="Keyboard Shortcuts (?)">
                <HelpCircle size={15} />
              </button>
            )}

            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5" />

            {/* Always icon-only: Favorite, Share */}
            <button onClick={handleToggleFavorite} disabled={isPendingFav}
              className={'p-2 rounded-xl transition-all '+(isFavorited?'text-red-500 bg-red-50 dark:bg-red-500/10':'text-gray-700 dark:text-gray-300 hover:text-red-500 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10')}
              title={isFavorited ? 'Favorited' : 'Favorite'}>
              <Heart size={15} className={isFavorited ? 'fill-red-500' : ''} />
            </button>

            <button onClick={handleShare}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              title="Share">
              {shareToast ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
            </button>

            {/* Overflow Menu (3-dot) */}
            <div className="relative" ref={overflowMenuRef}>
              <button onClick={()=>setShowOverflowMenu(p=>!p)}
                className={'p-2 rounded-xl transition-all '+(showOverflowMenu?'bg-[#6366F1] text-white':'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10')}
                title="More Options">
                <MoreHorizontal size={15} />
              </button>
              <AnimatePresence>
                {showOverflowMenu && (
                  <motion.div initial={{opacity:0,scale:0.92,y:4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:4}} transition={{duration:0.15}}
                    className="absolute bottom-full mb-2 right-0 z-50 bg-white dark:bg-[#1a1b38] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
                    {playerState==='playing'&&(
                      <button onClick={()=>{setShowVirtualPad(p=>!p);setShowOverflowMenu(false);}} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden">
                        <Gamepad2 size={14}/> {showVirtualPad?'Hide Gamepad':'Show Gamepad'}
                      </button>
                    )}
                    <button onClick={()=>{setShowArMenu(true);setShowOverflowMenu(false);}} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden">
                      <LayoutTemplate size={14}/> Aspect Ratio
                    </button>
                    <button onClick={()=>{setIsTheater(!isTheater);setShowOverflowMenu(false);}} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden">
                      <Monitor size={14}/> {isTheater?'Exit Theater':'Theater Mode'}
                    </button>
                    {playerState==='playing'&&(
                      <button onClick={()=>{handleScreenshot();setShowOverflowMenu(false);}} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden">
                        <Camera size={14}/> Screenshot
                      </button>
                    )}
                    {hasPipSupport&&playerState==='playing'&&(
                      <button onClick={()=>{handlePip();setShowOverflowMenu(false);}} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden">
                        <PictureInPicture2 size={14}/> {isPip?'Exit PiP':'Pop Out (PiP)'}
                      </button>
                    )}
                    {playerState==='playing'&&(
                      <button onClick={()=>{setShowShortcuts(true);setShowOverflowMenu(false);}} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden">
                        <HelpCircle size={14}/> Keyboard Shortcuts
                      </button>
                    )}
                    <div className="h-px bg-gray-200 dark:bg-white/10" />
                    <button onClick={()=>{handleReport();setShowOverflowMenu(false);}} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <Flag size={14}/> Report Issue
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cloud save deck pill */}
            <AnimatePresence>
              {cloudSaveStatus !== 'idle' && (
                <motion.div key="cloud-deck" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
                  className={'px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 '+(
                    cloudSaveStatus==='error'?'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
                      :'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400')}>
                  {(cloudSaveStatus==='saving'||cloudSaveStatus==='loading')?<Loader2 size={11} className="animate-spin"/>
                    :cloudSaveStatus==='error'?<CloudOff size={11}/>:<Cloud size={11}/>}
                  <span className="hidden sm:inline">
                    {cloudSaveStatus==='saving'&&'Saving...'}{cloudSaveStatus==='saved'&&'Synced'}
                    {cloudSaveStatus==='loading'&&'Loading...'}{cloudSaveStatus==='loaded'&&'Loaded'}
                    {cloudSaveStatus==='error'&&'Error'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

    </div>
  );
}
