"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Monitor,
  MonitorX,
  Volume2,
  Volume1,
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
  Pin,
  PinOff,
  Zap,
  Sparkles,
  Award,
  Flame,
  ArrowUpRight,
  Swords,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecentGames } from '@/hooks/useRecentGames';
import { saveGameState, loadGameState } from '@/app/games/actions';
import { toggleFavoriteGame } from '@/app/profile/actions';
import AdBanner from '@/components/AdBanner';
import CloudSaveBar from '@/components/CloudSaveBar';
import ScoreChallengeModal from '@/components/ScoreChallengeModal';
import PlayNextOverlay from '@/components/PlayNextOverlay';
import { queueOfflineScore, initOfflineSync } from '@/lib/offline-sync';

type PlayerState = 'idle' | 'ad' | 'rewarded_ad' | 'playing' | 'paused' | 'game_over';
type AspectRatio = '16:9' | '4:3' | '9:16' | 'auto';
type CloudSaveStatus = 'idle' | 'saving' | 'saved' | 'loading' | 'loaded' | 'error';
type GamepadMode = 'dual' | 'wasd' | 'arrows';
type GamepadOpacity = 'low' | 'med' | 'high';

// Virtual Gamepad key mappings (WASD + Arrows simultaneously)
const VPAD_KEY_PAIRS: Record<string, { key: string; code: string; secondaryKey?: string; secondaryCode?: string }> = {
  up: { key: 'ArrowUp', code: 'ArrowUp', secondaryKey: 'w', secondaryCode: 'KeyW' },
  down: { key: 'ArrowDown', code: 'ArrowDown', secondaryKey: 's', secondaryCode: 'KeyS' },
  left: { key: 'ArrowLeft', code: 'ArrowLeft', secondaryKey: 'a', secondaryCode: 'KeyA' },
  right: { key: 'ArrowRight', code: 'ArrowRight', secondaryKey: 'd', secondaryCode: 'KeyD' },
  a: { key: ' ', code: 'Space', secondaryKey: 'x', secondaryCode: 'KeyX' }, // Jump / Primary Action
  b: { key: 'Shift', code: 'ShiftLeft', secondaryKey: 'z', secondaryCode: 'KeyZ' }, // Run / Dash
  x: { key: 'e', code: 'KeyE', secondaryKey: 'c', secondaryCode: 'KeyC' }, // Interact / Use
  y: { key: 'q', code: 'KeyQ', secondaryKey: 'v', secondaryCode: 'KeyV' }, // Special / Switch
};

const AR_CLASSES: Record<AspectRatio, string> = {
  '16:9': 'aspect-video w-full',
  '4:3': 'aspect-[4/3] w-full max-w-[840px] mx-auto',
  '9:16': 'aspect-[9/16] w-full max-w-[420px] mx-auto min-h-[440px] sm:min-h-[500px]',
  'auto': 'w-full min-h-[300px] sm:min-h-[420px] md:min-h-[540px] xl:min-h-[620px]',
};

const SHORTCUTS = [
  { key: 'F', label: 'Fullscreen' },
  { key: 'T', label: 'Theater Mode' },
  { key: 'P', label: 'Pause / Resume' },
  { key: 'M', label: 'Mute / Unmute' },
  { key: 'R', label: 'Restart Game' },
  { key: 'Esc', label: 'Exit Fullscreen' },
  { key: '?', label: 'Keyboard Guide' },
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
  onGameOver?: (score: number) => Promise<any> | void;
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
  initialAspectRatio?: AspectRatio;
  orientation?: 'landscape' | 'portrait' | 'auto';
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
  initialAspectRatio,
  orientation,
}: GamePlayerProps) {
  const router = useRouter();
  const { addRecentGame } = useRecentGames();

  // Core player states
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false); // Bulletproof In-Page Floating Mini-Player
  const [reloadKey, setReloadKey] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [rewardedAdMsgId, setRewardedAdMsgId] = useState<number | null>(null);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPendingFav, startTransition] = useTransition();
  const [shareToast, setShareToast] = useState(false);
  const [favToast, setFavToast] = useState<'added' | 'removed' | null>(null);
  const favToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showHud, setShowHud] = useState(true);

  // Focus tracking
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);

  // Feature 1: Iframe Loading Buffer
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const iframeLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Feature 2: Mobile Virtual Gamepad (Dual Mode & Haptics)
  const [showVirtualPad, setShowVirtualPad] = useState(false);
  const [gamepadMode, setGamepadMode] = useState<GamepadMode>('dual');
  const [gamepadOpacity, setGamepadOpacity] = useState<GamepadOpacity>('med');
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  // Feature 3: Cloud Save Status
  const [cloudSaveStatus, setCloudSaveStatus] = useState<CloudSaveStatus>('idle');
  const cloudSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showPlayNext, setShowPlayNext] = useState(false);

  // Feature 4: Aspect Ratio (persisted across sessions)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => {
    if (initialAspectRatio) return initialAspectRatio;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('spielcade_player_ar');
        if (saved && ['16:9', '4:3', '9:16', 'auto'].includes(saved)) {
          return saved as AspectRatio;
        }
      } catch {}
    }
    if (orientation === 'portrait') return '9:16';
    return '16:9';
  });
  const [showArMenu, setShowArMenu] = useState(false);

  const handleSelectAspectRatio = (ar: AspectRatio) => {
    setAspectRatio(ar);
    try {
      localStorage.setItem('spielcade_player_ar', ar);
    } catch {}
  };

  useEffect(() => {
    if (initialAspectRatio) {
      setAspectRatio(initialAspectRatio);
    } else if (orientation === 'portrait') {
      setAspectRatio('9:16');
    }
  }, [initialAspectRatio, orientation]);

  // Feature 5: Ambient Glow
  const ambientColor = useRef<string>('#6366F1');

  // Improvement 1: Session Timer
  const [sessionTime, setSessionTime] = useState(0);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Improvement 2: Score Toast & Personal Best
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showScoreToast, setShowScoreToast] = useState(false);
  const scoreToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Improvement 3: Achievement Notifications
  const [unlockedAchievement, setUnlockedAchievement] = useState<{ title: string; xp?: number } | null>(null);
  const achievementTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Improvement 4: Swipe Gestures
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);

  // Improvement 5: Shortcuts Modal
  const [showShortcuts, setShowShortcuts] = useState(false);
  const shortcutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Improvement 6: Screenshot Engine
  const [screenshotToast, setScreenshotToast] = useState<'success' | 'postcard' | 'hint' | null>(null);

  // Improvement 7: Overflow Menu
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const overflowMenuRef = useRef<HTMLDivElement>(null);
  const volumeMenuRef = useRef<HTMLDivElement>(null);

  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasRecordedRef = useRef(false);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Improvement 8: Offline Queue Sync
  const [offlineSyncMsg, setOfflineSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = initOfflineSync();
    const handleSync = (e: Event) => {
      const customEvt = e as CustomEvent;
      const count = customEvt.detail?.count || 1;
      setOfflineSyncMsg(`🏆 Synced ${count} offline ${count === 1 ? 'score' : 'scores'} to leaderboard!`);
      setTimeout(() => setOfflineSyncMsg(null), 4000);
    };
    window.addEventListener('spielcade:scores-synced', handleSync);
    return () => {
      cleanup();
      window.removeEventListener('spielcade:scores-synced', handleSync);
    };
  }, []);

  // Initialize stored preferences (volume, muted, personal best)
  useEffect(() => {
    try {
      const storedVol = localStorage.getItem('spielcade_player_volume');
      if (storedVol !== null) setVolume(Number(storedVol));

      const storedMute = localStorage.getItem('spielcade_player_muted');
      if (storedMute !== null) setIsMuted(storedMute === 'true');

      const storedPB = localStorage.getItem(`spielcade_pb_${slug}`);
      if (storedPB !== null) setPersonalBest(Number(storedPB));
    } catch {}
  }, [slug]);

  // Ambient color derived from game category
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

  // Smart Focus Trapper: restore focus to iframe smoothly
  const refocusGame = useCallback(() => {
    if (iframeRef.current && playerState === 'playing') {
      try {
        iframeRef.current.focus();
      } catch {}
    }
  }, [playerState]);

  // Cloud status helper with auto-dismiss
  const setCloudStatus = useCallback((status: CloudSaveStatus) => {
    setCloudSaveStatus(status);
    if (cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
    if (status === 'saved' || status === 'loaded' || status === 'error') {
      cloudSaveTimerRef.current = setTimeout(() => setCloudSaveStatus('idle'), 3000);
    }
  }, []);

  // Live session timer
  useEffect(() => {
    if (playerState === 'playing') {
      sessionIntervalRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    } else {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    }
    return () => {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    };
  }, [playerState]);

  // Visibility change persistence (WakeLock + Tab switch)
  useEffect(() => {
    if (playerState !== 'playing') return;
    const handleVisibility = async () => {
      const iframe = iframeRef.current;
      if (document.hidden) {
        iframe?.contentWindow?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'PAGE_HIDDEN' }, '*');
        if (wakeLockRef.current) {
          wakeLockRef.current.release().catch(() => {});
          wakeLockRef.current = null;
        }
      } else {
        iframe?.contentWindow?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'PAGE_VISIBLE' }, '*');
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
          try {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          } catch {}
        }
        refocusGame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [playerState, refocusGame]);

  // Click-outside listener for menus
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
      if (volumeMenuRef.current && !volumeMenuRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Sync initialFavorited with guest localStorage support
  useEffect(() => {
    try {
      const guestFavs: string[] = JSON.parse(localStorage.getItem('spielcade_guest_favorites') || '[]');
      if (guestFavs.includes(slug) || (gameId && guestFavs.includes(gameId))) {
        setIsFavorited(true);
      } else {
        setIsFavorited(initialFavorited);
      }
    } catch {
      setIsFavorited(initialFavorited);
    }
  }, [initialFavorited, slug, gameId]);

  // WakeLock API management
  useEffect(() => {
    const acquire = async () => {
      if (playerState === 'playing' && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch {}
      } else if (playerState !== 'playing' && wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
    acquire();
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [playerState]);

  // Body scroll lock
  useEffect(() => {
    if (isTheater || isWebFullscreen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isTheater, isWebFullscreen]);

  // In-Game HUD timer
  const resetHudTimer = () => {
    setShowHud(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    if (isTheater || isFullscreen || isWebFullscreen) {
      hudTimerRef.current = setTimeout(() => setShowHud(false), 3200);
    }
  };

  useEffect(() => {
    if (isTheater || isFullscreen || isWebFullscreen) resetHudTimer();
    else {
      setShowHud(true);
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    }
  }, [isTheater, isFullscreen, isWebFullscreen]);

  // Play button click
  const handlePlay = () => {
    setPlayerState('ad');
    setIsIframeLoading(true);
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    iframeLoadTimeoutRef.current = setTimeout(() => setIsIframeLoading(false), 12000);
    addRecentGame({ slug, title, image });
  };

  useEffect(() => {
    if (slug && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      addRecentGame({ slug, title, image });
    }
  }, [slug, title, image, addRecentGame]);

  // Pre-roll Ad countdown with auto-transition
  useEffect(() => {
    if (playerState === 'ad') {
      if (adCountdown > 0) {
        const t = setTimeout(() => setAdCountdown(p => p - 1), 1000);
        return () => clearTimeout(t);
      } else if (adCountdown === 0) {
        skipAd();
      }
    } else if (playerState === 'rewarded_ad' && adCountdown > 0) {
      const t = setTimeout(() => setAdCountdown(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [playerState, adCountdown]);

  // Skip Ad -> transition to playing
  const skipAd = () => {
    setPlayerState('playing');
    broadcastAudioState(isMuted, volume);
    setTimeout(() => refocusGame(), 100);
  };

  const handleIframeLoad = () => {
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    broadcastAudioState(isMuted, volume);
    setTimeout(() => {
      setIsIframeLoading(false);
      refocusGame();
      broadcastAudioState(isMuted, volume);
    }, 600);
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
          msgId: rewardedAdMsgId,
        }, '*');
      }
      setRewardedAdMsgId(null);
    }
    refocusGame();
  };

  // Audio Engine: Volume & Mute control
  const broadcastAudioState = useCallback((muted: boolean, volLevel: number) => {
    const iframe = iframeRef.current || containerRef.current?.querySelector('iframe');
    if (iframe?.contentWindow) {
      const normalizedVol = muted ? 0 : volLevel / 100;
      iframe.contentWindow.postMessage({ type: 'SET_MUTE', isMuted: muted, mute: muted }, '*');
      iframe.contentWindow.postMessage({ type: 'SET_VOLUME', volume: normalizedVol, value: normalizedVol }, '*');
      iframe.contentWindow.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'AUDIO_STATE', payload: { isMuted: muted, volume: normalizedVol } }, '*');
      iframe.contentWindow.postMessage(JSON.stringify({ action: muted ? 'mute' : 'unmute', volume: normalizedVol }), '*');
    }
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    try {
      localStorage.setItem('spielcade_player_muted', String(next));
    } catch {}
    broadcastAudioState(next, volume);
    refocusGame();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    const unmuted = isMuted && newVol > 0 ? false : isMuted;
    if (isMuted && newVol > 0) setIsMuted(false);
    try {
      localStorage.setItem('spielcade_player_volume', String(newVol));
      localStorage.setItem('spielcade_player_muted', String(unmuted));
    } catch {}
    broadcastAudioState(unmuted, newVol);
  };

  // Reload Game
  const handleReload = () => {
    setIsReloading(true);
    setIsIframeLoading(true);
    setSessionTime(0);
    setReloadKey(p => p + 1);
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    iframeLoadTimeoutRef.current = setTimeout(() => setIsIframeLoading(false), 12000);
    setTimeout(() => {
      setIsReloading(false);
      refocusGame();
    }, 600);
  };

  // Pause / Resume Engine
  const togglePause = () => {
    if (playerState === 'playing') {
      setPlayerState('paused');
      const iframe = iframeRef.current;
      iframe?.contentWindow?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'PAUSE', action: 'pause' }, '*');
    } else if (playerState === 'paused') {
      setPlayerState('playing');
      const iframe = iframeRef.current;
      iframe?.contentWindow?.postMessage({ source: 'SPIELCADE_WRAPPER', type: 'RESUME', action: 'resume' }, '*');
      refocusGame();
    }
  };

  // Fullscreen Engine
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      if (screen.orientation && (screen.orientation as any).unlock) {
        try { (screen.orientation as any).unlock(); } catch {}
      }
    } else if (isWebFullscreen) {
      setIsWebFullscreen(false);
      if (screen.orientation && (screen.orientation as any).unlock) {
        try { (screen.orientation as any).unlock(); } catch {}
      }
    } else if (containerRef.current) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
          setIsTheater(false);
          setIsMiniPlayer(false);
          if (screen.orientation && (screen.orientation as any).lock) {
            const targetOrientation = aspectRatio === '9:16' ? 'portrait' : 'landscape';
            (screen.orientation as any).lock(targetOrientation).catch(() => {});
          }
        } else {
          setIsWebFullscreen(true);
          setIsTheater(false);
          setIsMiniPlayer(false);
        }
      } catch {
        setIsWebFullscreen(true);
        setIsTheater(false);
        setIsMiniPlayer(false);
      }
    }
    refocusGame();
  };

  useEffect(() => {
    const h = () => {
      const a = !!document.fullscreenElement;
      setIsFullscreen(a);
      if (a) setIsTheater(false);
    };
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  // Keyboard Hotkeys
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (playerState !== 'playing' && playerState !== 'paused') return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        if (containerRef.current?.contains(document.activeElement) || document.activeElement === document.body) {
          e.preventDefault();
        }
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTheater(p => !p);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReload();
      } else if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (playerState === 'paused') {
          togglePause();
          return;
        }
        if (isTheater) setIsTheater(false);
        if (isWebFullscreen) setIsWebFullscreen(false);
        if (isMiniPlayer) setIsMiniPlayer(false);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(p => !p);
        if (shortcutTimerRef.current) clearTimeout(shortcutTimerRef.current);
        shortcutTimerRef.current = setTimeout(() => setShowShortcuts(false), 5000);
      }
    };

    window.addEventListener('keydown', handle, { passive: false });
    return () => window.removeEventListener('keydown', handle);
  }, [playerState, isTheater, isWebFullscreen, isMuted, isMiniPlayer, showShortcuts]);

  // SDK & Game Message Receiver Protocol
  useEffect(() => {
    if ((playerState !== 'playing' && playerState !== 'paused') || !sourceUrl) return;

    const handle = async (event: MessageEvent) => {
      if (!event.data) return;

      // 1. SPIELCADE_SDK
      if (event.data.source === 'SPIELCADE_SDK') {
        switch (event.data.type) {
          case 'GAME_READY':
          case 'INIT':
            setIsIframeLoading(false);
            if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
            break;

          case 'SUBMIT_SCORE': {
            const score = Number(event.data.payload?.score ?? 0);
            if (score > 0) {
              setLiveScore(score);
              setShowScoreToast(true);

              // Check personal best
              if (personalBest === null || score > personalBest) {
                setPersonalBest(score);
                setIsNewRecord(true);
                try {
                  localStorage.setItem(`spielcade_pb_${slug}`, String(score));
                } catch {}
              } else {
                setIsNewRecord(false);
              }

              if (scoreToastTimerRef.current) clearTimeout(scoreToastTimerRef.current);
              scoreToastTimerRef.current = setTimeout(() => setShowScoreToast(false), 3000);
            }
            if (score > 0) {
              if (typeof navigator !== 'undefined' && !navigator.onLine) {
                queueOfflineScore(slug, score);
              } else if (onGameOver) {
                Promise.resolve(onGameOver(score)).then((res: any) => {
                  if (res?.newAchievements && res.newAchievements.length > 0) {
                    const firstAch = res.newAchievements[0];
                    setUnlockedAchievement({ title: firstAch.title, xp: firstAch.xp });
                    if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
                    achievementTimerRef.current = setTimeout(() => setUnlockedAchievement(null), 4500);
                  }
                }).catch(() => {
                  queueOfflineScore(slug, score);
                });
              }
            }
            break;
          }

          case 'UNLOCK_ACHIEVEMENT': {
            const key = event.data.payload?.key || 'Master Player';
            const achTitle = key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            setUnlockedAchievement({ title: achTitle, xp: 50 });
            if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
            achievementTimerRef.current = setTimeout(() => setUnlockedAchievement(null), 4500);
            break;
          }

          case 'GAME_OVER':
            setPlayerState('game_over');
            setShowPlayNext(true);
            break;

          case 'SHOW_REWARDED_AD':
            setAdCountdown(5);
            setRewardedAdMsgId(event.data.msgId);
            setPlayerState('rewarded_ad');
            break;

          case 'SAVE_DATA': {
            setCloudStatus('saving');
            const res = await saveGameState(slug, event.data.payload.data);
            event.source?.postMessage({
              source: 'SPIELCADE_WRAPPER',
              type: 'SAVE_DATA_RESPONSE',
              payload: res,
              msgId: event.data.msgId,
            }, { targetOrigin: '*' });
            setCloudStatus(res ? 'saved' : 'error');
            break;
          }

          case 'LOAD_DATA': {
            setCloudStatus('loading');
            const res = await loadGameState(slug);
            event.source?.postMessage({
              source: 'SPIELCADE_WRAPPER',
              type: 'LOAD_DATA_RESPONSE',
              payload: res,
              msgId: event.data.msgId,
            }, { targetOrigin: '*' });
            setCloudStatus(res ? 'loaded' : 'error');
            break;
          }
        }
      }

      // 2. Generic HTML5 / Poki / CrazyGames fallback events
      try {
        const raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (raw) {
          if (raw.type === 'gameReady' || raw.type === 'loadingStop' || raw.event === 'gameLoaded') {
            setIsIframeLoading(false);
          }
          if (raw.type === 'score' || raw.type === 'gameover' || raw.action === 'game_over' || raw.event === 'gameover' || raw.name === 'gameOver') {
            const score = Number(raw.score || raw.points || raw.value || raw.finalScore || 0);
            if (score > 0) {
              setLiveScore(score);
              setShowScoreToast(true);
              if (personalBest === null || score > personalBest) {
                setPersonalBest(score);
                setIsNewRecord(true);
                try {
                  localStorage.setItem(`spielcade_pb_${slug}`, String(score));
                } catch {}
              }
              if (typeof navigator !== 'undefined' && !navigator.onLine) {
                queueOfflineScore(slug, score);
              } else if (onGameOver) {
                Promise.resolve(onGameOver(score)).catch(() => {
                  queueOfflineScore(slug, score);
                });
              }
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [playerState, sourceUrl, onGameOver, slug, personalBest, setCloudStatus]);

  // Clean up timers on unmount
  useEffect(() => () => {
    [
      iframeLoadTimeoutRef,
      cloudSaveTimerRef,
      hudTimerRef,
      scoreToastTimerRef,
      achievementTimerRef,
      shortcutTimerRef,
    ].forEach(r => {
      if (r.current) clearTimeout(r.current);
    });
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
  }, []);

  // Dual-Mode Virtual Gamepad Dispatcher with Haptic Feedback
  const dispatchKeyInternal = useCallback((key: string, code: string, type: 'keydown' | 'keyup') => {
    const iframe = iframeRef.current;

    // 1. Dispatch to local React games / window if no iframe
    if (!iframe) {
      try {
        const evt = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
        window.dispatchEvent(evt);
        document.dispatchEvent(evt);
        if (containerRef.current) {
          containerRef.current.dispatchEvent(evt);
        }
      } catch {}
      return;
    }

    // 2. Dispatch inside same-origin document safely
    try {
      if (iframe.contentDocument) {
        const evt = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
        iframe.contentDocument.dispatchEvent(evt);
      }
    } catch {}

    // 3. Dispatch postMessage for cross-origin game engines
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        source: 'SPIELCADE_WRAPPER',
        type: type === 'keydown' ? 'KEY_DOWN' : 'KEY_UP',
        key,
        code,
      }, '*');
    }
  }, []);

  const handleVpadPress = useCallback((action: string) => {
    const pair = VPAD_KEY_PAIRS[action];
    if (!pair) return;

    // Haptic feedback for tactile arcade feel
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }

    if (!pressedKeysRef.current.has(pair.key)) {
      pressedKeysRef.current.add(pair.key);
      dispatchKeyInternal(pair.key, pair.code, 'keydown');
    }

    // Dual-dispatch WASD if in dual mode or wasd mode
    if (pair.secondaryKey && (gamepadMode === 'dual' || gamepadMode === 'wasd')) {
      if (!pressedKeysRef.current.has(pair.secondaryKey)) {
        pressedKeysRef.current.add(pair.secondaryKey);
        dispatchKeyInternal(pair.secondaryKey, pair.secondaryCode || 'Key' + pair.secondaryKey.toUpperCase(), 'keydown');
      }
    }
  }, [dispatchKeyInternal, gamepadMode]);

  const handleVpadRelease = useCallback((action: string) => {
    const pair = VPAD_KEY_PAIRS[action];
    if (!pair) return;

    pressedKeysRef.current.delete(pair.key);
    dispatchKeyInternal(pair.key, pair.code, 'keyup');

    if (pair.secondaryKey) {
      pressedKeysRef.current.delete(pair.secondaryKey);
      dispatchKeyInternal(pair.secondaryKey, pair.secondaryCode || 'Key' + pair.secondaryKey.toUpperCase(), 'keyup');
    }
  }, [dispatchKeyInternal]);

  const vpadProps = (action: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      handleVpadPress(action);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      handleVpadRelease(action);
    },
    onPointerLeave: () => handleVpadRelease(action),
    onPointerCancel: () => handleVpadRelease(action),
  });

  // Mobile Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    resetHudTimer();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartYRef.current;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(dy) <= Math.abs(dx)) return;

    if (dy > 75 && (isTheater || isFullscreen || isWebFullscreen || isMiniPlayer)) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      setIsWebFullscreen(false);
      setIsTheater(false);
      setIsMiniPlayer(false);
    } else if (dy < -75 && !isTheater && !isFullscreen && !isWebFullscreen && !isMiniPlayer) {
      setIsTheater(true);
    }
  };

  // Instant High-Resolution Screenshot & Gamer Card Engine
  const handleScreenshot = () => {
    try {
      const iframe = iframeRef.current;
      let capturedDirectCanvas = false;

      // 1. If game has an accessible same-origin canvas, capture it directly
      try {
        if (iframe?.contentDocument) {
          const gameCanvas = iframe.contentDocument.querySelector('canvas');
          if (gameCanvas) {
            gameCanvas.toBlob(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${slug}-screenshot-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
              }
            });
            setScreenshotToast('success');
            capturedDirectCanvas = true;
          }
        }
      } catch {}

      if (capturedDirectCanvas) {
        setTimeout(() => setScreenshotToast(null), 3500);
        return;
      }

      // 2. Generate an ultra-sharp 1200x630 Gamer Card with Game Poster, High Score & Spielcade Verified Seal
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 1200;
      cardCanvas.height = 630;
      const ctx = cardCanvas.getContext('2d');
      if (!ctx) {
        setScreenshotToast('hint');
        setTimeout(() => setScreenshotToast(null), 3500);
        return;
      }

      // Dark futuristic background
      ctx.fillStyle = '#060611';
      ctx.fillRect(0, 0, 1200, 630);

      // Radial Category Ambient Glow
      const grad = ctx.createRadialGradient(600, 315, 60, 600, 315, 600);
      grad.addColorStop(0, `${ambientColor.current}50`);
      grad.addColorStop(0.7, '#060611');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);

      // Grid pattern overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1200; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 630);
        ctx.stroke();
      }
      for (let y = 0; y < 630; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Branding Header
      ctx.fillStyle = '#6366F1';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('SPIELCADE.COM', 80, 85);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('● VERIFIED GAMEPLAY SNAPSHOT', 360, 82);

      // Game Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 64px sans-serif';
      ctx.fillText(title, 80, 190);

      // Category & Session time
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 28px sans-serif';
      ctx.fillText(`Category: ${category || 'Arcade'}  •  Session Time: ${fmtTime(sessionTime)}`, 80, 250);

      // Score / Record Highlight Card
      const displayScore = liveScore !== null && liveScore > 0 ? liveScore : personalBest;
      if (displayScore) {
        // Glowing pill background
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(80, 300, 520, 100, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText(`★ ${displayScore.toLocaleString()} PTS`, 110, 365);

        ctx.fillStyle = '#E4E4E7';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('HIGH SCORE RECORD', 380, 360);
      }

      // Footer
      ctx.fillStyle = '#71717A';
      ctx.font = '500 22px sans-serif';
      ctx.fillText('Play 17,000+ free unblocked online games directly in your browser with no downloads', 80, 550);

      // Draw poster if loaded
      const exportCanvas = () => {
        cardCanvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${slug}-snapshot-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            setScreenshotToast('postcard');
          } else {
            setScreenshotToast('hint');
          }
        });
      };

      if (image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            // Draw thumbnail in corner with rounded border
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(850, 140, 270, 270, 24);
            ctx.clip();
            ctx.drawImage(img, 850, 140, 270, 270);
            ctx.restore();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(850, 140, 270, 270, 24);
            ctx.stroke();
          } catch {}
          exportCanvas();
        };
        img.onerror = () => exportCanvas();
        img.src = image;
      } else {
        exportCanvas();
      }
    } catch {
      setScreenshotToast('hint');
    }

    setTimeout(() => setScreenshotToast(null), 3500);
  };

  // Mini-Player Toggle (Crash-proof, stays in same React tree)
  const toggleMiniPlayer = () => {
    // On small mobile screens (< 768px), floating miniplayer causes screen collision with bottom bar; scroll into view instead
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsMiniPlayer(prev => !prev);
    setIsTheater(false);
    refocusGame();
  };

  // Favorite toggle (Works seamlessly for guests + authenticated users)
  const handleToggleFavorite = () => {
    const next = !isFavorited;
    setIsFavorited(next);
    setFavToast(next ? 'added' : 'removed');
    if (favToastTimerRef.current) clearTimeout(favToastTimerRef.current);
    favToastTimerRef.current = setTimeout(() => setFavToast(null), 2500);

    // Persist immediately in guest localStorage
    try {
      const guestFavs: string[] = JSON.parse(localStorage.getItem('spielcade_guest_favorites') || '[]');
      const keysToAdd = [slug, ...(gameId ? [gameId] : [])];
      let updated: string[];
      if (next) {
        updated = Array.from(new Set([...guestFavs, ...keysToAdd]));
      } else {
        updated = guestFavs.filter(id => id !== slug && (!gameId || id !== gameId));
      }
      localStorage.setItem('spielcade_guest_favorites', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save favorite in localStorage:', e);
    }

    // Sync to Supabase in background if gameId exists
    if (gameId) {
      startTransition(async () => {
        try {
          await toggleFavoriteGame(gameId);
        } catch (err) {
          console.warn('Background favorite sync skipped:', err);
        }
      });
    }

    refocusGame();
  };

  // Share Game
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = personalBest
      ? `I scored ${personalBest.toLocaleString()} pts on ${title}! Can you beat my record?`
      : `Play ${title} free online in your browser — no downloads!`;
    const data = { title: `Play ${title} Unblocked | Spielcade`, text: shareText, url };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch {}
    }
    refocusGame();
  };

  // Manual Toolbar Cloud Save Trigger
  const handleToolbarCloudSave = async () => {
    setCloudSaveStatus('saving');
    try {
      const payload = {
        timestamp: Date.now(),
        savedAt: new Date().toISOString(),
        gameSlug: slug,
        score: liveScore || personalBest || 0,
      };

      if (iframeRef?.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage({
            type: 'SPIELCADE_SAVE_REQUEST',
            action: 'SAVE_STATE',
            slug
          }, '*');
        } catch {}
      }

      const res = await saveGameState(slug, payload);
      try {
        localStorage.setItem(`spielcade_save_${slug}`, JSON.stringify(payload));
      } catch {}

      setCloudSaveStatus(res?.success !== false ? 'saved' : 'error');
    } catch {
      setCloudSaveStatus('saved');
    }

    if (cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
    cloudSaveTimerRef.current = setTimeout(() => {
      setCloudSaveStatus('idle');
    }, 3000);
    refocusGame();
  };

  const handleReport = () => {
    window.open(`/contact?subject=Report%20Game%20Issue&game=${encodeURIComponent(slug)}`, '_blank');
  };

  const isExpandedMode = isTheater || isFullscreen || isWebFullscreen;

  return (
    <div className="w-full flex flex-col select-none relative overflow-x-clip">

      {/* Feature 5: Cinematic GPU Ambient Back-Glow */}
      {playerState === 'playing' && !isMiniPlayer && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-3xl opacity-25 blur-3xl transition-opacity duration-1000 z-0 overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at center, ${ambientColor.current}60 0%, transparent 70%)`,
            willChange: 'opacity',
          }}
        />
      )}

      {/* Mini-Player Placeholder when game is pinned to corner */}
      {isMiniPlayer && (
        <div
          onClick={() => setIsMiniPlayer(false)}
          className={`w-full ${AR_CLASSES[aspectRatio]} rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-gray-100/50 dark:bg-white/5 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all hover:border-[#6366F1]`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight size={28} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 dark:text-white font-outfit">
              {title} is playing in Mini-Player
            </p>
            <p className="text-xs text-gray-500 mt-1">Click anywhere here to return the game to full view</p>
          </div>
        </div>
      )}

      {/* Primary Display Canvas (Seamlessly floats to corner when isMiniPlayer is active) */}
      <div
        ref={containerRef}
        tabIndex={0}
        onClick={refocusGame}
        onMouseMove={resetHudTimer}
        onMouseEnter={() => setIsCanvasHovered(true)}
        onMouseLeave={() => setIsCanvasHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative bg-black overflow-hidden shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-center outline-none ${
          playerState === 'playing' ? 'touch-none' : 'touch-manipulation'
        } ${
          isMiniPlayer
            ? 'fixed bottom-6 right-6 z-[999] w-[340px] sm:w-[420px] aspect-video rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border-2 border-white/20 hidden md:flex'
            : isWebFullscreen
              ? 'fixed inset-0 z-[1000] w-screen h-screen rounded-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]'
              : isTheater
                ? 'fixed inset-2 md:inset-6 lg:inset-10 z-[100] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10'
                : `${AR_CLASSES[aspectRatio]} rounded-2xl border border-gray-200 dark:border-white/10`
        }`}
      >
        {/* Mini-Player Hover Controls Bar */}
        {isMiniPlayer && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-2.5 flex items-center justify-between text-white">
            <span className="text-xs font-bold truncate max-w-[200px] font-outfit drop-shadow">{title}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleMute}
                className="p-1.5 bg-black/60 hover:bg-white/20 rounded-lg transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} />}
              </button>
              <button
                onClick={() => setIsMiniPlayer(false)}
                className="p-1.5 bg-black/60 hover:bg-white/20 rounded-lg transition-colors"
                title="Expand to Full View"
              >
                <ArrowUpRight size={14} />
              </button>
              <button
                onClick={() => setIsMiniPlayer(false)}
                className="p-1.5 bg-black/60 hover:bg-red-600 rounded-lg transition-colors"
                title="Close Mini-Player"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Swipe drag-indicator bar in theater / fullscreen */}
        {isExpandedMode && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-12 h-1 rounded-full bg-white/25 pointer-events-none" />
        )}

        {/* Persistent Touch Quick-Exit & Controls Handle in Fullscreen / Theater */}
        {isExpandedMode && !showHud && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setShowHud(true)}
            className="absolute top-3 right-3 z-50 bg-black/70 hover:bg-black/90 text-white/90 border border-white/25 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-2xl flex items-center gap-1.5 active:scale-95 transition-all pointer-events-auto"
            title="Show Controls / Exit"
            aria-label="Show Controls"
          >
            <MoreHorizontal size={14} />
            <span className="text-[11px]">Menu</span>
          </motion.button>
        )}

        {/* Theater Mode Background Dimming */}
        {isTheater && !document.fullscreenElement && (
          <div
            className="fixed inset-0 bg-black/95 z-[-1] backdrop-blur-md"
            onClick={() => setIsTheater(false)}
          />
        )}

        <AnimatePresence mode="wait">

          {/* 1. IDLE STATE: Poster & Play Button */}
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
                  onClick={e => {
                    e.stopPropagation();
                    handlePlay();
                  }}
                  aria-label={`Play ${title}`}
                  className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#6366F1] text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_50px_rgba(99,102,241,0.7)]"
                >
                  <div className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-30" />
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

          {/* 2. PRE-ROLL AD STATE */}
          {playerState === 'ad' && (
            <motion.div
              key="ad"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20 p-4 sm:p-6"
            >
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white/60 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Loading Game Assets
              </div>
              <div className="w-full max-w-md p-2 sm:p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-[#6366F1] border-t-transparent animate-spin mb-3 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                <h3 className="text-white font-bold text-base sm:text-xl mb-1 font-outfit">Starting {title}...</h3>
                <p className="text-gray-400 text-xs max-w-xs mb-3">
                  Your game is initializing. Support independent game creators by viewing sponsor announcements.
                </p>
                {/* Responsive Pre-roll Ad Banner */}
                <div className="w-full flex justify-center my-1 max-w-[320px]">
                  <AdBanner id="5a3fd317f38a51c8553f75f8c2a547ef" width={300} height={250} className="rounded-xl shadow-lg" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                {adCountdown > 2 ? (
                  <div className="px-4 py-2 bg-black/60 border border-white/10 text-white/70 rounded-full text-xs font-bold backdrop-blur-md">
                    Skip in {adCountdown}s
                  </div>
                ) : (
                  <button
                    onClick={skipAd}
                    className="px-5 py-2 sm:px-6 sm:py-2.5 bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 rounded-full text-xs sm:text-sm font-bold shadow-2xl transition-all flex items-center gap-2"
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
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Rewarded Sponsor
              </div>
              <div className="w-full max-w-md p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mb-6 shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
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
          {(playerState === 'playing' || playerState === 'paused') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-row relative z-10 bg-black overflow-hidden"
            >
              {/* Left Skyscraper Ad (Hidden in mini-player and fullscreen) */}
              {!isMiniPlayer && !isFullscreen && !isWebFullscreen && (
                <div className={`hidden ${isTheater ? 'xl:flex' : '2xl:flex'} flex-col justify-center items-center px-3 bg-gray-950 border-r border-white/5 z-20 shrink-0`}>
                  <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
                </div>
              )}

              {/* Game Viewport Container (STAYS CONSTANT IN DOM — NEVER UNMOUNTS) */}
              <div className="flex-1 h-full relative flex justify-center items-center pointer-events-auto z-10 min-w-0">
                {sourceUrl ? (
                  <>
                    <iframe
                      key={reloadKey}
                      ref={iframeRef}
                      src={sourceUrl}
                      onLoad={handleIframeLoad}
                      className="absolute inset-0 w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads"
                      allow="fullscreen; autoplay; gamepad; focus-without-user-activation; accelerometer; gyroscope; clipboard-write; clipboard-read; microphone; camera; midi; payment; xr-spatial-tracking; screen-wake-lock"
                      title={title}
                    />

                    {/* Feature 1: Iframe Loading Buffer */}
                    <AnimatePresence>
                      {isIframeLoading && !isMiniPlayer && (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950"
                        >
                          {image && (
                            <img
                              src={image}
                              alt={title}
                              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110"
                            />
                          )}
                          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
                            <div className="relative w-20 h-20">
                              <div
                                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                                style={{ borderColor: `${ambientColor.current} transparent transparent transparent` }}
                              />
                              <div className="absolute inset-2 rounded-full border-2 border-white/10 animate-pulse" />
                              {image ? (
                                <img src={image} alt="" className="absolute inset-3 rounded-full object-cover" />
                              ) : (
                                <div className="absolute inset-3 rounded-full bg-white/10 flex items-center justify-center">
                                  <Loader2 size={20} className="text-white/60 animate-spin" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-bold text-base sm:text-lg font-outfit">Loading {title}</p>
                              <p className="text-gray-400 text-xs mt-1">Initializing WebGL engine & assets...</p>
                            </div>
                            <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full w-full rounded-full opacity-80"
                                style={{
                                  background: `linear-gradient(90deg, transparent 0%, ${ambientColor.current} 50%, transparent 100%)`,
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 1.5s ease-in-out infinite',
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  children
                )}

                {/* Pause Overlay (Hidden in mini-player) */}
                <AnimatePresence>
                  {playerState === 'paused' && !isMiniPlayer && (
                    <motion.div
                      key="pause-screen"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center"
                    >
                      <div className="bg-[#111228]/90 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1]/40 flex items-center justify-center text-[#6366F1]">
                          <Pause size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white font-outfit">Game Paused</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{title} • {category}</p>
                        </div>

                        {sessionTime > 0 && (
                          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                            <Timer size={13} /> <span>Session Time: {fmtTime(sessionTime)}</span>
                          </div>
                        )}

                        <div className="w-full flex flex-col gap-2 mt-2">
                          <button
                            onClick={togglePause}
                            className="w-full py-2.5 bg-[#6366F1] hover:bg-[#5356e8] text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <Play size={14} className="fill-white" /> Resume (P)
                          </button>
                          <button
                            onClick={() => { togglePause(); handleReload(); }}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <RotateCcw size={14} /> Restart Run
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Skyscraper Ad (Hidden in mini-player and fullscreen) */}
              {!isMiniPlayer && !isFullscreen && !isWebFullscreen && (
                <div className={`hidden ${isTheater ? 'xl:flex' : '2xl:flex'} flex-col justify-center items-center px-3 bg-gray-950 border-l border-white/5 z-20 shrink-0`}>
                  <AdBanner id="f782d4b90dcb09f70975f654ba40ab19" width={160} height={600} />
                </div>
              )}

              {/* Share Toast */}
              <AnimatePresence>
                {shareToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/30"
                  >
                    <Check size={14} className="stroke-[3]" /> Link copied with your score!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Favorite Toast */}
              <AnimatePresence>
                {favToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`absolute top-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border backdrop-blur-md ${
                      favToast === 'added'
                        ? 'bg-red-600/95 text-white border-red-400/40 shadow-red-500/25'
                        : 'bg-gray-800/95 text-gray-200 border-white/20'
                    }`}
                  >
                    <Heart size={14} className={favToast === 'added' ? 'fill-white stroke-[2.5]' : 'stroke-[2.5]'} />
                    {favToast === 'added' ? 'Added to your favorites!' : 'Removed from favorites'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Score Toast & New Record Banner */}
              <AnimatePresence>
                {showScoreToast && liveScore !== null && !isMiniPlayer && (
                  <motion.div
                    key="score"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 z-[70] pointer-events-none"
                  >
                    <div className="bg-black/90 border border-yellow-400/40 text-yellow-300 px-6 py-3 rounded-2xl text-lg font-black backdrop-blur-md shadow-2xl flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2.5">
                        <Trophy size={20} className="text-yellow-400" />
                        <span>+{liveScore.toLocaleString()} pts</span>
                        <Zap size={16} className="text-yellow-300" />
                      </div>
                      {isNewRecord && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Flame size={12} /> NEW PERSONAL RECORD!
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Achievement Notification Banner (Xbox / Steam Style) */}
              <AnimatePresence>
                {unlockedAchievement && !isMiniPlayer && (
                  <motion.div
                    key="ach"
                    initial={{ opacity: 0, y: -40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    className="absolute top-5 left-1/2 -translate-x-1/2 z-[80] bg-[#111228]/95 border border-yellow-500/40 text-white px-5 py-3 rounded-2xl backdrop-blur-xl shadow-[0_10px_35px_rgba(234,179,8,0.3)] flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-yellow-400 shrink-0">
                      <Award size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-yellow-400 tracking-wider flex items-center gap-1">
                        <Sparkles size={11} /> Achievement Unlocked
                      </span>
                      <h4 className="text-sm font-bold text-white font-outfit">{unlockedAchievement.title}</h4>
                    </div>
                    {unlockedAchievement.xp && (
                      <span className="ml-2 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 rounded-lg text-xs font-black">
                        +{unlockedAchievement.xp} XP
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Offline Queue Sync Toast Banner */}
              <AnimatePresence>
                {offlineSyncMsg && !isMiniPlayer && (
                  <motion.div
                    key="offline-sync"
                    initial={{ opacity: 0, y: -40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-[85] bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-5 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center gap-2.5 font-bold text-xs"
                  >
                    <Trophy size={16} className="text-yellow-400" />
                    <span>{offlineSyncMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Screenshot Toast Notification */}
              <AnimatePresence>
                {screenshotToast && (
                  <motion.div
                    key="sshot"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`absolute top-6 right-4 z-[70] px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 ${
                      screenshotToast === 'success'
                        ? 'bg-emerald-600 text-white border border-emerald-400/30'
                        : screenshotToast === 'postcard'
                          ? 'bg-[#6366F1] text-white border border-indigo-400/30'
                          : 'bg-gray-800 text-gray-200 border border-white/10'
                    }`}
                  >
                    <Camera size={13} />
                    {screenshotToast === 'success' && 'Gameplay snapshot downloaded!'}
                    {screenshotToast === 'postcard' && 'Gamer card saved to downloads!'}
                    {screenshotToast === 'hint' && 'Use Windows+Shift+S / Cmd+Shift+4'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cloud Save Pill */}
              <AnimatePresence>
                {cloudSaveStatus !== 'idle' && !isMiniPlayer && (
                  <motion.div
                    key="cloud"
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    className={`absolute top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none ${
                      cloudSaveStatus === 'error'
                        ? 'bg-red-900/80 border-red-500/30 text-red-300'
                        : cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading'
                          ? 'bg-blue-900/80 border-blue-500/30 text-blue-200'
                          : 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200'
                    }`}
                  >
                    {(cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading') && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    {cloudSaveStatus === 'saving' && '💾 Saving to cloud...'}
                    {cloudSaveStatus === 'saved' && '☁️ Cloud Save Synced'}
                    {cloudSaveStatus === 'loading' && '☁️ Loading Save...'}
                    {cloudSaveStatus === 'loaded' && '☁️ Save Loaded'}
                    {cloudSaveStatus === 'error' && '⚠️ Save Error'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Post-Game "Play Next" Continuous Engagement Overlay */}
              {showPlayNext && !isMiniPlayer && (
                <PlayNextOverlay
                  currentSlug={slug}
                  category={category}
                  relatedGames={relatedGames}
                  onDismiss={() => setShowPlayNext(false)}
                  onPlayAgain={handleRestart}
                />
              )}

              {/* Keyboard Shortcuts Guide Modal */}
              <AnimatePresence>
                {showShortcuts && (
                  <motion.div
                    key="shortcuts"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
                    onClick={() => setShowShortcuts(false)}
                  >
                    <div
                      className="bg-[#111228] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-xs w-full"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-sm font-outfit flex items-center gap-2">
                          <HelpCircle size={16} className="text-[#6366F1]" /> Keyboard Shortcuts
                        </h3>
                        <button onClick={() => setShowShortcuts(false)} className="text-white/40 hover:text-white transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {SHORTCUTS.map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                            <span className="text-gray-400 text-xs">{label}</span>
                            <kbd className="px-2.5 py-1 bg-white/10 border border-white/15 rounded-md text-white text-xs font-mono font-bold shadow-sm">
                              {key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-500 text-[11px] text-center mt-4">Auto-closes in 5s • Press ? to toggle</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feature 2: Dual-Mode Mobile Virtual Gamepad (Haptics + Opacity) */}
              <AnimatePresence>
                {showVirtualPad && !isMiniPlayer && (
                  <motion.div
                    key="vpad"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 25 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute bottom-4 left-0 right-0 z-40 flex items-end px-4 pointer-events-none justify-between ${
                      isLeftHanded ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* D-Pad Cluster */}
                    <div
                      className={`pointer-events-auto relative w-[136px] h-[136px] select-none rounded-2xl ${
                        gamepadOpacity === 'low'
                          ? 'opacity-40'
                          : gamepadOpacity === 'high'
                            ? 'opacity-95'
                            : 'opacity-70'
                      }`}
                    >
                      <button
                        {...vpadProps('up')}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 bg-black/80 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-[#6366F1] touch-none shadow-lg"
                        aria-label="Up"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5m0 0-7 7m7-7 7 7"/></svg>
                      </button>
                      <button
                        {...vpadProps('down')}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 bg-black/80 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-[#6366F1] touch-none shadow-lg"
                        aria-label="Down"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14m0 0 7-7m-7 7-7-7"/></svg>
                      </button>
                      <button
                        {...vpadProps('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/80 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-[#6366F1] touch-none shadow-lg"
                        aria-label="Left"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5m0 0 7 7M5 12l7-7"/></svg>
                      </button>
                      <button
                        {...vpadProps('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/80 border border-white/20 rounded-xl flex items-center justify-center text-white active:bg-[#6366F1] touch-none shadow-lg"
                        aria-label="Right"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m0 0-7-7m7 7-7 7"/></svg>
                      </button>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20" />
                      </div>
                    </div>

                    {/* Center Mode Switcher Badge */}
                    <div className="pointer-events-auto flex flex-col items-center gap-1.5 pb-2">
                      <button
                        onClick={() => setGamepadMode(m => (m === 'dual' ? 'wasd' : m === 'wasd' ? 'arrows' : 'dual'))}
                        className="px-2.5 py-1 bg-black/70 border border-white/15 rounded-lg text-[10px] font-bold text-white/80 uppercase tracking-wider backdrop-blur-md active:scale-95 transition-all"
                        title="Toggle Control Mapping"
                      >
                        {gamepadMode === 'dual' ? 'Dual (WASD+Arrows)' : gamepadMode === 'wasd' ? 'WASD' : 'Arrows'}
                      </button>
                    </div>

                    {/* Action Buttons Cluster (A, B, X, Y) */}
                    <div
                      className={`pointer-events-auto relative w-[136px] h-[136px] select-none rounded-2xl ${
                        gamepadOpacity === 'low'
                          ? 'opacity-40'
                          : gamepadOpacity === 'high'
                            ? 'opacity-95'
                            : 'opacity-70'
                      }`}
                    >
                      <button
                        {...vpadProps('a')}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-emerald-600/90 border border-emerald-400/40 rounded-full flex flex-col items-center justify-center text-white text-xs font-black active:scale-90 touch-none shadow-lg"
                        aria-label="Action A"
                      >
                        <span>A</span>
                        <span className="text-[8px] opacity-75 font-mono">SPACE</span>
                      </button>
                      <button
                        {...vpadProps('b')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-red-600/90 border border-red-400/40 rounded-full flex flex-col items-center justify-center text-white text-xs font-black active:scale-90 touch-none shadow-lg"
                        aria-label="Action B"
                      >
                        <span>B</span>
                        <span className="text-[8px] opacity-75 font-mono">SHIFT</span>
                      </button>
                      <button
                        {...vpadProps('x')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600/90 border border-blue-400/40 rounded-full flex flex-col items-center justify-center text-white text-xs font-black active:scale-90 touch-none shadow-lg"
                        aria-label="Action X"
                      >
                        <span>X</span>
                        <span className="text-[8px] opacity-75 font-mono">E</span>
                      </button>
                      <button
                        {...vpadProps('y')}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-500/90 border border-amber-400/40 rounded-full flex flex-col items-center justify-center text-white text-xs font-black active:scale-90 touch-none shadow-lg"
                        aria-label="Action Y"
                      >
                        <span>Y</span>
                        <span className="text-[8px] opacity-75 font-mono">Q</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating In-Game HUD (Auto-Hiding in Immersive Modes) */}
              {isExpandedMode && (
                <AnimatePresence>
                  {showHud && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 50, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50 px-4"
                    >
                      <div className="bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-2.5 flex items-center gap-3 sm:gap-5 shadow-2xl pointer-events-auto">
                        <span className="text-xs font-bold text-white max-w-[120px] sm:max-w-xs truncate font-outfit">
                          {title}
                        </span>
                        {sessionTime > 0 && (
                          <span className="text-[10px] text-white/50 font-mono hidden sm:inline">
                            {fmtTime(sessionTime)}
                          </span>
                        )}

                        <div className="w-px h-5 bg-white/15" />

                        {/* Pause */}
                        <button
                          onClick={togglePause}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all"
                          title={playerState === 'paused' ? 'Resume (P)' : 'Pause (P)'}
                        >
                          {playerState === 'paused' ? <Play size={17} className="fill-white" /> : <Pause size={17} />}
                        </button>

                        {/* Reload */}
                        <button
                          onClick={handleReload}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all"
                          title="Restart (R)"
                        >
                          <RotateCcw size={17} className={isReloading ? 'animate-spin text-[#6366F1]' : ''} />
                        </button>

                        {/* Mute */}
                        <button
                          onClick={handleToggleMute}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all"
                          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                        >
                          {isMuted ? <VolumeX size={17} className="text-red-400" /> : <Volume2 size={17} />}
                        </button>

                        {isTheater && (
                          <button
                            onClick={() => setIsTheater(false)}
                            className="text-[#6366F1] hover:text-white hover:scale-110 transition-all"
                            title="Exit Theater (T)"
                          >
                            <MonitorX size={17} />
                          </button>
                        )}

                        {/* Fullscreen */}
                        <button
                          onClick={toggleFullscreen}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all"
                          title={isFullscreen || isWebFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                        >
                          {isFullscreen || isWebFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                        </button>

                        <div className="w-px h-5 bg-white/15" />

                        {/* Favorite */}
                        <button
                          onClick={handleToggleFavorite}
                          className={`hover:scale-110 transition-all ${isFavorited ? 'text-red-500' : 'text-white/80 hover:text-white'}`}
                          title="Favorite"
                        >
                          <Heart size={17} className={isFavorited ? 'fill-red-500' : ''} />
                        </button>

                        {/* Share */}
                        <button
                          onClick={handleShare}
                          className="text-white/80 hover:text-white hover:scale-110 transition-all"
                          title="Share"
                        >
                          {shareToast ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
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
                          title="Exit Immersive Mode (Esc)"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* 4. GAME OVER STATE */}
          {playerState === 'game_over' && (
            <motion.div
              key="game_over"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-4 md:p-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-1 font-outfit tracking-wide">Game Over</h2>

              {/* Score display */}
              {liveScore !== null && liveScore > 0 && (
                <div className="flex flex-col items-center gap-1 mb-3 px-6 py-2.5 bg-yellow-500/10 border border-yellow-400/25 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-400" />
                    <span className="text-yellow-300 font-black text-2xl">{liveScore.toLocaleString()}</span>
                    <span className="text-yellow-400/60 text-xs font-semibold">pts</span>
                  </div>
                  {isNewRecord && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Flame size={12} /> New Personal Best Record!
                    </span>
                  )}
                </div>
              )}

              {/* Session Time & Record */}
              <div className="flex items-center gap-4 mb-5 text-gray-400 text-xs">
                {sessionTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Timer size={13} /> <span>Played: {fmtTime(sessionTime)}</span>
                  </div>
                )}
                {personalBest && (
                  <div className="flex items-center gap-1 text-amber-400/90 font-semibold">
                    <Award size={13} /> <span>Record: {personalBest.toLocaleString()} pts</span>
                  </div>
                )}
              </div>

              <p className="text-gray-400 mb-5 text-xs sm:text-sm">
                Ready for your next run? Pick another challenge or jump back in:
              </p>

              {/* Dynamic Up Next recommendation grid */}
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

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPlayerState('playing');
                    setSessionTime(0);
                    refocusGame();
                  }}
                  className="px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#5457DF] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                >
                  <RotateCcw size={18} /> Play Again
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Docked Pro Control Deck (Standard View) */}
      {!isTheater && !isFullscreen && !isWebFullscreen && (
        <div className="w-full mt-3 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 transition-colors">

          {/* Left: Identity + Timer + Personal Best */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {image && (
              <img
                src={image}
                alt={title}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-white/10 hidden xs:block shadow-sm"
              />
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate font-outfit">{title}</h3>
              <div className="flex items-center gap-2.5 flex-wrap">
                {category && <span className="text-[11px] font-semibold text-[#6366F1]">{category}</span>}
                {playerState === 'playing' && sessionTime > 0 && (
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1">
                    <Timer size={10} /> {fmtTime(sessionTime)}
                  </span>
                )}
                {personalBest && (
                  <span className="text-[11px] text-amber-500/90 font-bold hidden sm:flex items-center gap-1">
                    <Award size={11} /> {personalBest.toLocaleString()} pts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Tiered Control Suite */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

            {/* Tier 1: Always Visible Actions */}

            {/* Pause / Resume */}
            {playerState === 'playing' && (
              <button
                onClick={togglePause}
                className="p-2 min-w-[36px] min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Pause Game (P)"
                aria-label="Pause Game"
              >
                <Pause size={15} />
                <span className="hidden xl:inline">Pause</span>
              </button>
            )}

            {/* Restart */}
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="p-2 min-w-[36px] min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Restart Game (R)"
              aria-label="Restart Game"
            >
              <RotateCcw size={15} className={isReloading ? 'animate-spin text-[#6366F1]' : ''} />
              <span className="hidden xl:inline">Restart</span>
            </button>

            {/* Interactive Volume Slider */}
            <div className="relative" ref={volumeMenuRef}>
              <button
                onClick={handleToggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="p-2 min-w-[36px] min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
                title={isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
                aria-label="Toggle Sound"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={15} className="text-red-500" />
                ) : volume < 50 ? (
                  <Volume1 size={15} />
                ) : (
                  <Volume2 size={15} />
                )}
                <span className="hidden xl:inline">{isMuted ? 'Muted' : `${volume}%`}</span>
              </button>

              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    className="absolute bottom-full mb-2 -left-2 z-50 bg-white dark:bg-[#1a1b38] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-3 flex flex-col items-center gap-2 min-w-[140px]"
                  >
                    <div className="flex items-center justify-between w-full text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      <span>Volume</span>
                      <span>{isMuted ? '0%' : `${volume}%`}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={e => handleVolumeChange(Number(e.target.value))}
                      className="w-full accent-[#6366F1] cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 min-w-[36px] min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Fullscreen (F)"
              aria-label="Fullscreen"
            >
              <Maximize2 size={15} />
              <span className="hidden xl:inline">Fullscreen</span>
            </button>

            {/* Virtual Gamepad Toggle (Promoted to mobile toolbar for instant thumb access) */}
            {playerState === 'playing' && (
              <button
                onClick={() => {
                  setShowVirtualPad(p => !p);
                  refocusGame();
                }}
                className={`flex p-2 min-w-[36px] min-h-[36px] justify-center rounded-xl transition-all items-center gap-1.5 text-xs font-semibold ${
                  showVirtualPad
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                    : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
                title="Virtual Touch Gamepad"
                aria-label="Toggle Mobile Virtual Gamepad"
              >
                <Gamepad2 size={16} />
              </button>
            )}

            {/* Aspect Ratio Selector */}
            <div className="hidden sm:block relative">
              <button
                onClick={() => setShowArMenu(p => !p)}
                className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Aspect Ratio"
              >
                <LayoutTemplate size={15} />
              </button>
              <AnimatePresence>
                {showArMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 right-0 z-50 bg-white dark:bg-[#1a1b38] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[138px]"
                  >
                    {(['16:9', '4:3', '9:16', 'auto'] as AspectRatio[]).map(ar => (
                      <button
                        key={ar}
                        onClick={() => {
                          handleSelectAspectRatio(ar);
                          setShowArMenu(false);
                          refocusGame();
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs font-semibold flex items-center gap-2 transition-colors ${
                          aspectRatio === ar
                            ? 'bg-[#6366F1] text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        {aspectRatio === ar ? <Check size={11} /> : <span className="w-[11px]" />}
                        <span>{ar === 'auto' ? 'Auto' : ar}</span>
                        <span className="ml-auto text-[10px] opacity-60">
                          {ar === '16:9' ? 'Standard' : ar === '4:3' ? 'Retro' : ar === '9:16' ? 'Vertical' : 'Fill'}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theater Mode */}
            <button
              onClick={() => {
                setIsTheater(!isTheater);
                refocusGame();
              }}
              className={`hidden md:flex p-2 rounded-xl transition-all items-center gap-1.5 text-xs font-semibold ${
                isTheater
                  ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                  : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
              title="Theater Mode (T)"
            >
              <Monitor size={15} />
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

            {/* Tier 3: Pro Tools (Mini-Player Pin, Screenshot, Help) */}

            {/* Mini-Player Pin Button (100% stable, zero crash) */}
            {(playerState === 'playing' || playerState === 'paused') && (
              <button
                onClick={toggleMiniPlayer}
                className={`hidden md:flex p-2 rounded-xl transition-all ${
                  isMiniPlayer
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
                title={isMiniPlayer ? 'Unpin Mini-Player' : 'Pin to Corner (Mini-Player)'}
              >
                {isMiniPlayer ? <PinOff size={15} /> : <Pin size={15} />}
              </button>
            )}

            {/* Screenshot */}
            {(playerState === 'playing' || playerState === 'paused') && (
              <button
                onClick={handleScreenshot}
                className="hidden md:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                title="Save Gameplay Snapshot (Camera)"
              >
                <Camera size={15} />
              </button>
            )}

            {/* Shortcuts Guide */}
            <button
              onClick={() => setShowShortcuts(p => !p)}
              className="hidden md:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle size={15} />
            </button>

            {/* Social & Save Tools (Visible on sm+, in 3-dot menu on mobile) */}
            <button
              onClick={handleToggleFavorite}
              disabled={isPendingFav}
              className={`hidden sm:flex p-2 rounded-xl transition-all ${
                isFavorited
                  ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
                  : 'text-gray-700 dark:text-gray-300 hover:text-red-500 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
              title={isFavorited ? 'Favorited' : 'Add to Favorites'}
            >
              <Heart size={15} className={isFavorited ? 'fill-red-500' : ''} />
            </button>

            <button
              onClick={handleShare}
              className="hidden sm:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              title="Share Game & Score"
            >
              {shareToast ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
            </button>

            {/* Cloud Save Button */}
            <button
              onClick={handleToolbarCloudSave}
              disabled={cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading'}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cloudSaveStatus === 'saved'
                  ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20'
                  : cloudSaveStatus === 'saving'
                  ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
              title={cloudSaveStatus === 'saved' ? 'Cloud Save Synced!' : 'Save Progress to Cloud'}
            >
              <Cloud size={15} className={cloudSaveStatus === 'saving' ? 'animate-spin text-[#6366F1]' : ''} />
              <span className="hidden md:inline">
                {cloudSaveStatus === 'saving' ? 'Saving...' : cloudSaveStatus === 'saved' ? 'Synced' : 'Cloud Save'}
              </span>
            </button>

            {/* Viral Challenge Button */}
            <button
              onClick={() => setShowChallengeModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0 ${
                isNewRecord
                  ? 'ring-2 ring-pink-400 shadow-lg shadow-pink-500/50 animate-pulse'
                  : 'shadow-md shadow-pink-500/20'
              }`}
              title="Challenge a Friend to beat your score!"
            >
              <Swords size={14} className="text-yellow-300" />
              <span>{isNewRecord ? '⚔️ Challenge Now!' : 'Challenge'}</span>
            </button>

            {/* Play Next Button */}
            <button
              onClick={() => setShowPlayNext(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
              title="Play Next Game"
            >
              <Sparkles size={14} className="text-yellow-400" />
              <span className="hidden xl:inline">Next Game</span>
            </button>

            {/* Overflow 3-Dot Menu for Mobile & Extended Tools */}
            <div className="relative" ref={overflowMenuRef}>
              <button
                onClick={() => setShowOverflowMenu(p => !p)}
                className={`p-2 rounded-xl transition-all ${
                  showOverflowMenu
                    ? 'bg-[#6366F1] text-white'
                    : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
                title="More Options"
              >
                <MoreHorizontal size={15} />
              </button>

              <AnimatePresence>
                {showOverflowMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 right-0 z-50 bg-white dark:bg-[#1a1b38] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
                  >
                    {/* Play Next (Mobile) */}
                    <button
                      onClick={() => {
                        setShowPlayNext(true);
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                    >
                      <Sparkles size={14} className="text-yellow-400" /> Play Next Game
                    </button>

                    {/* Challenge (Mobile) */}
                    <button
                      onClick={() => {
                        setShowChallengeModal(true);
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-black flex items-center gap-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Swords size={14} className="text-rose-500" /> Challenge a Friend
                    </button>

                    {/* Cloud Save (Mobile) */}
                    <button
                      onClick={() => {
                        handleToolbarCloudSave();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                    >
                      <Cloud size={14} /> Cloud Save Progress
                    </button>

                    {/* Favorite (Mobile) */}
                    <button
                      onClick={() => {
                        handleToggleFavorite();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                    >
                      <Heart size={14} className={isFavorited ? 'fill-red-500 text-red-500' : ''} /> {isFavorited ? 'Favorited' : 'Add to Favorites'}
                    </button>

                    {/* Share (Mobile) */}
                    <button
                      onClick={() => {
                        handleShare();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                    >
                      <Share2 size={14} /> Share Game & Score
                    </button>

                    {/* Aspect Ratio Selector (Direct inline picker for mobile) */}
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5 sm:hidden">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-1.5 flex items-center gap-1.5">
                        <LayoutTemplate size={12} /> Aspect Ratio
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {(['16:9', '4:3', '9:16', 'auto'] as AspectRatio[]).map(ar => (
                          <button
                            key={ar}
                            onClick={() => {
                              handleSelectAspectRatio(ar);
                              setShowOverflowMenu(false);
                              refocusGame();
                            }}
                            className={`px-1 py-1 rounded-lg text-[10px] font-bold text-center transition-colors ${
                              aspectRatio === ar
                                ? 'bg-[#6366F1] text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {ar}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gamepad toggle */}
                    <button
                      onClick={() => {
                        setShowVirtualPad(p => !p);
                        setShowOverflowMenu(false);
                        refocusGame();
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                    >
                      <Gamepad2 size={14} /> {showVirtualPad ? 'Hide Gamepad' : 'Show Gamepad'}
                    </button>

                    {/* Theater */}
                    <button
                      onClick={() => {
                        setIsTheater(!isTheater);
                        setShowOverflowMenu(false);
                        refocusGame();
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden"
                    >
                      <Monitor size={14} /> {isTheater ? 'Exit Theater' : 'Theater Mode'}
                    </button>

                    {/* Screenshot */}
                    <button
                      onClick={() => {
                        handleScreenshot();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden"
                    >
                      <Camera size={14} /> Take Screenshot
                    </button>

                    {/* Mini-Player Pin */}
                    {(playerState === 'playing' || playerState === 'paused') && (
                      <button
                        onClick={() => {
                          toggleMiniPlayer();
                          setShowOverflowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden"
                      >
                        <Pin size={14} /> {isMiniPlayer ? 'Unpin Player' : 'Pin to Corner (Mini-Player)'}
                      </button>
                    )}

                    {/* Shortcuts Guide */}
                    <button
                      onClick={() => {
                        setShowShortcuts(true);
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden"
                    >
                      <HelpCircle size={14} /> Keyboard Shortcuts
                    </button>

                    <div className="h-px bg-gray-200 dark:bg-white/10" />

                    {/* Report */}
                    <button
                      onClick={() => {
                        handleReport();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Flag size={14} /> Report Issue
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cloud Save status pill in Control Deck */}
            <AnimatePresence>
              {cloudSaveStatus !== 'idle' && (
                <motion.div
                  key="cloud-deck"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
                    cloudSaveStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading' ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : cloudSaveStatus === 'error' ? (
                    <CloudOff size={11} />
                  ) : (
                    <Cloud size={11} />
                  )}
                  <span className="hidden sm:inline">
                    {cloudSaveStatus === 'saving' && 'Saving...'}
                    {cloudSaveStatus === 'saved' && 'Synced'}
                    {cloudSaveStatus === 'loading' && 'Loading...'}
                    {cloudSaveStatus === 'loaded' && 'Loaded'}
                    {cloudSaveStatus === 'error' && 'Error'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Dedicated In-Player Cloud Save Control Bar */}
      <CloudSaveBar
        slug={slug}
        title={title}
        iframeRef={iframeRef}
        className="mt-4"
      />

      {/* High-Score Viral Challenge Modal */}
      <ScoreChallengeModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        slug={slug}
        gameTitle={title}
        gameImage={image}
        currentScore={liveScore || personalBest || 1500}
      />

      {/* Shimmer animation keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

    </div>
  );
}
