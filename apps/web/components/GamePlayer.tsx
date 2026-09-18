"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import {
  ArrowUpRight,
  Volume2,
  VolumeX,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecentGames } from '@/hooks/useRecentGames';
import { saveGameState, loadGameState, submitScore } from '@/app/games/actions';
import { toggleFavoriteGame } from '@/app/profile/actions';
import CloudSaveBar from '@/components/CloudSaveBar';
import ScoreChallengeModal from '@/components/ScoreChallengeModal';
import PlayNextOverlay from '@/components/PlayNextOverlay';
import BugReportModal from '@/components/BugReportModal';
import { queueOfflineScore, initOfflineSync } from '@/lib/offline-sync';
import { arcadeAudio } from '@/lib/arcade-audio';
import GamepadHUD from '@/components/GamepadHUD';
import { gamepadEngine } from '@/lib/gamepad-engine';
import { GAME_IFRAME_SANDBOX, GAME_IFRAME_PERMISSIONS } from '@/lib/constants';
import ClipRecorderModal from '@/components/ClipRecorderModal';
import { generateTradingCardSnapshot } from '@/lib/clip-recorder';
import VirtualControlsOverlay from '@/components/VirtualControlsOverlay';
import MixtapeModal from '@/components/MixtapeModal';

// Sub-modules
import {
  PlayerState,
  AspectRatio,
  CloudSaveStatus,
  GamePlayerProps,
  AR_CLASSES,
} from './player/types';
import {
  PlayerIdleOverlay,
  PlayerLoadingOverlay,
  PlayerPauseOverlay,
  PlayerRotateHint,
  PlayerImmersiveHUD,
  PlayerPointerLockToast,
  PlayerWebGLRecoveryOverlay,
} from './player/PlayerOverlays';
import PlayerScoreToasts from './player/PlayerScoreToasts';
import PlayerGameOverScreen from './player/PlayerGameOverScreen';
import PlayerKeyboardGuide from './player/PlayerKeyboardGuide';
import PlayerControlDeck from './player/PlayerControlDeck';

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
  challenger,
  challengerScore,
}: GamePlayerProps) {
  const { addRecentGame } = useRecentGames();

  // Core player states
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(100);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPendingFav, startTransition] = useTransition();
  const [shareToast, setShareToast] = useState(false);
  const [favToast, setFavToast] = useState<'added' | 'removed' | null>(null);
  const favToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showHud, setShowHud] = useState(true);

  // Focus tracking
  const [, setIsCanvasHovered] = useState(false);

  // Iframe Loading Buffer
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const iframeLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Virtual Gamepad
  const [showVirtualPad, setShowVirtualPad] = useState(false);

  // Cloud Save Status
  const [cloudSaveStatus, setCloudSaveStatus] = useState<CloudSaveStatus>('idle');
  const cloudSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showPlayNext, setShowPlayNext] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [snapshotCardUrl, setSnapshotCardUrl] = useState<string | null>(null);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isMixtapeModalOpen, setIsMixtapeModalOpen] = useState(false);

  // Aspect Ratio (persisted across sessions)
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

  const handleSelectAspectRatio = (ar: AspectRatio) => {
    setAspectRatio(ar);
    try {
      localStorage.setItem('spielcade_player_ar', ar);
    } catch {}
    refocusGame();
  };

  useEffect(() => {
    if (initialAspectRatio) {
      setAspectRatio(initialAspectRatio);
    } else if (orientation === 'portrait') {
      setAspectRatio('9:16');
    }
  }, [initialAspectRatio, orientation]);

  // Ambient Glow
  const ambientColor = useRef<string>('#6366F1');

  // Session Timer
  const [sessionTime, setSessionTime] = useState(0);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Score Toast & Personal Best
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showScoreToast, setShowScoreToast] = useState(false);
  const scoreToastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasBeatenChallenge, setHasBeatenChallenge] = useState(false);

  // Achievements & Toasts
  const [unlockedAchievement, setUnlockedAchievement] = useState<{ title: string; xp?: number } | null>(null);
  const achievementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const shortcutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [screenshotToast, setScreenshotToast] = useState<'success' | 'postcard' | 'hint' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasRecordedRef = useRef(false);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);
  const [offlineSyncMsg, setOfflineSyncMsg] = useState<string | null>(null);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissRotateHint, setDismissRotateHint] = useState(false);
  const [resumedCheckpointToast, setResumedCheckpointToast] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [isWebGLContextLost, setIsWebGLContextLost] = useState(false);

  // Speculative pre-warming of iframe CDN connections on component mount
  useEffect(() => {
    if (sourceUrl && typeof document !== 'undefined') {
      try {
        const parsed = new URL(sourceUrl);
        const origin = parsed.origin;
        if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
          const preconn = document.createElement('link');
          preconn.rel = 'preconnect';
          preconn.href = origin;
          preconn.crossOrigin = 'anonymous';
          document.head.appendChild(preconn);
        }
      } catch {}
    }
  }, [sourceUrl]);

  // Offline Queue Sync
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

  // Broadcast active gameplay to hide/restore bottom navigation on mobile
  useEffect(() => {
    const isPlaying = playerState === 'playing';
    try {
      window.dispatchEvent(new CustomEvent('spielcade:gameplay-state', { detail: { isPlaying } }));
    } catch {}
    return () => {
      try {
        window.dispatchEvent(new CustomEvent('spielcade:gameplay-state', { detail: { isPlaying: false } }));
      } catch {}
    };
  }, [playerState]);

  // Check stored virtual gamepad preference (touch devices only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const isTouch = 'ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0);
      const storedPad = localStorage.getItem('spielcade_virtual_pad_enabled');
      if (storedPad === 'true' && isTouch) {
        setShowVirtualPad(true);
      }
    } catch {}
  }, []);

  // Mobile portrait orientation detector
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Stored preferences
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

  // Cross-device QR checkpoint auto-resume
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const resumeRaw = urlParams.get('resumeState');
      if (resumeRaw) {
        const payload = JSON.parse(decodeURIComponent(resumeRaw));
        localStorage.setItem(`spielcade_save_${slug}`, JSON.stringify(payload));
        setResumedCheckpointToast(true);
        arcadeAudio.playVictory();
        setTimeout(() => setResumedCheckpointToast(false), 6000);
      }
    } catch {}
  }, [slug]);

  // Ambient color derived from game category
  useEffect(() => {
    const map: Record<string, string> = {
      action: '#EF4444',
      adventure: '#F59E0B',
      puzzle: '#8B5CF6',
      racing: '#F97316',
      sports: '#10B981',
      shooting: '#EF4444',
      strategy: '#3B82F6',
      arcade: '#EC4899',
      rpg: '#A855F7',
      horror: '#6B7280',
      simulation: '#14B8A6',
      platform: '#F59E0B',
    };
    const key = (category || '').toLowerCase();
    const match = Object.keys(map).find(k => key.includes(k));
    ambientColor.current = match ? map[match] : '#6366F1';
  }, [category]);

  // WebAudio Autoplay Unlocker for Mobile & Desktop (Web Audio API)
  const unlockAudioContext = useCallback(() => {
    try {
      const AudioCtxClass =
        typeof window !== 'undefined'
          ? (window as any).AudioContext || (window as any).webkitAudioContext
          : null;
      if (AudioCtxClass) {
        const tempCtx = new AudioCtxClass();
        if (tempCtx.state === 'suspended') {
          tempCtx.resume().then(() => tempCtx.close()).catch(() => {});
        } else {
          tempCtx.close().catch(() => {});
        }
      }
    } catch {}
  }, []);

  // Smart Focus Trapper
  const refocusGame = useCallback(() => {
    unlockAudioContext();
    if (iframeRef.current && playerState === 'playing') {
      try {
        iframeRef.current.focus();
      } catch {}
    }
  }, [playerState, unlockAudioContext]);

  // Sync Universal Gamepad target window with active game iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow && playerState === 'playing') {
      gamepadEngine.setTargetWindow(iframeRef.current.contentWindow);
    } else {
      gamepadEngine.setTargetWindow(null);
    }
  }, [playerState, reloadKey]);

  // Cloud status helper
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

  // Visibility change persistence
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

  // Sync initialFavorited with guest localStorage
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

  // Play button click (Instant 1-click play matching Poki & CrazyGames)
  const handlePlay = () => {
    arcadeAudio.playBlip();
    unlockAudioContext();
    setPlayerState('playing');
    setIsIframeLoading(true);
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    iframeLoadTimeoutRef.current = setTimeout(() => setIsIframeLoading(false), 5000);
    addRecentGame({ slug, title, image });
    try {
      window.dispatchEvent(
        new CustomEvent('spielcade:award-xp', {
          detail: { amount: 25, reason: `Played ${title}` },
        })
      );
    } catch {}

    // Auto-focus the game iframe immediately
    setTimeout(() => {
      refocusGame();
    }, 80);

    // Mobile Viewport Auto-Dock (Poki / CrazyGames ergonomic standard)
    if (typeof window !== 'undefined' && window.innerWidth < 768 && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  useEffect(() => {
    if (slug && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      addRecentGame({ slug, title, image });
    }
  }, [slug, title, image, addRecentGame]);

  // Audio Engine
  const broadcastAudioState = useCallback((muted: boolean, volLevel: number) => {
    const iframe = iframeRef.current || containerRef.current?.querySelector('iframe');
    if (iframe?.contentWindow) {
      const normalizedVol = muted ? 0 : volLevel / 100;
      iframe.contentWindow.postMessage({ type: 'SET_MUTE', isMuted: muted, mute: muted }, '*');
      iframe.contentWindow.postMessage({ type: 'SET_VOLUME', volume: normalizedVol, value: normalizedVol }, '*');
      iframe.contentWindow.postMessage(
        { source: 'SPIELCADE_WRAPPER', type: 'AUDIO_STATE', payload: { isMuted: muted, volume: normalizedVol } },
        '*'
      );
      iframe.contentWindow.postMessage(JSON.stringify({ action: muted ? 'mute' : 'unmute', volume: normalizedVol }), '*');
    }
  }, []);

  const handleIframeLoad = () => {
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    broadcastAudioState(isMuted, volume);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const resumeRaw = urlParams.get('resumeState');
      if (resumeRaw) {
        const payload = JSON.parse(decodeURIComponent(resumeRaw));
        const iframe = iframeRef.current || containerRef.current?.querySelector('iframe');
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'SPIELCADE_RESTORE_STATE',
              action: 'RESTORE_STATE',
              slug,
              payload,
            },
            '*'
          );
        }
      }
    } catch {}

    setIsIframeLoading(false);
    refocusGame();
    broadcastAudioState(isMuted, volume);
  };

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

  const handleReload = () => {
    setIsReloading(true);
    setIsIframeLoading(true);
    setSessionTime(0);
    setReloadKey(p => p + 1);
    if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
    iframeLoadTimeoutRef.current = setTimeout(() => setIsIframeLoading(false), 5000);
    setTimeout(() => {
      setIsReloading(false);
      refocusGame();
    }, 600);
  };

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

  // 3D Heavy Games: Pointer Lock Coordinator
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = Boolean(
        document.pointerLockElement &&
          (containerRef.current?.contains(document.pointerLockElement) ||
            document.pointerLockElement === iframeRef.current)
      );
      setIsPointerLocked(isLocked);
    };
    const handlePointerLockError = () => {
      setIsPointerLocked(false);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
    };
  }, []);

  // 3D Heavy Games: WebGL Context Loss Lifecycle Supervisor
  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setIsWebGLContextLost(true);
    };
    const handleContextRestored = () => {
      setIsWebGLContextLost(false);
      refocusGame();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('webglcontextlost', handleContextLost);
      container.addEventListener('webglcontextrestored', handleContextRestored);
    }
    return () => {
      if (container) {
        container.removeEventListener('webglcontextlost', handleContextLost);
        container.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [refocusGame]);

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
        if (isPointerLocked) {
          try {
            if (document.exitPointerLock) document.exitPointerLock();
          } catch {}
          setIsPointerLocked(false);
        }
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
    if ((playerState !== 'playing' && playerState !== 'paused') || (!sourceUrl && !children)) return;

    const handle = async (event: MessageEvent) => {
      if (!event.data) return;

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

              if (challengerScore && score > challengerScore) {
                setHasBeatenChallenge(true);
              }

              if (personalBest === null || score > personalBest) {
                setPersonalBest(score);
                setIsNewRecord(true);
                try {
                  localStorage.setItem(`spielcade_pb_${slug}`, String(score));
                } catch {}
                try {
                  window.dispatchEvent(
                    new CustomEvent('spielcade:award-xp', {
                      detail: { amount: 75, reason: `New Personal Best in ${title}!` },
                    })
                  );
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
              } else {
                const handler = onGameOver || ((sc: number) => submitScore(slug, sc));
                Promise.resolve(handler(score))
                  .then((res: any) => {
                    if (res?.newAchievements && res.newAchievements.length > 0) {
                      const firstAch = res.newAchievements[0];
                      setUnlockedAchievement({ title: firstAch.title, xp: firstAch.xp });
                      if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
                      achievementTimerRef.current = setTimeout(() => setUnlockedAchievement(null), 4500);
                    }
                  })
                  .catch(() => {
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
            // In-player ads are removed: grant reward immediately with zero delay
            if (event.source) {
              try {
                (event.source as any).postMessage(
                  {
                    source: 'SPIELCADE_WRAPPER',
                    type: 'REWARDED_AD_COMPLETE',
                    payload: { success: true },
                    msgId: event.data.msgId,
                  },
                  '*'
                );
              } catch {}
            }
            break;

          case 'SAVE_DATA': {
            setCloudStatus('saving');
            const res = await saveGameState(slug, event.data.payload.data);
            event.source?.postMessage(
              {
                source: 'SPIELCADE_WRAPPER',
                type: 'SAVE_DATA_RESPONSE',
                payload: res,
                msgId: event.data.msgId,
              },
              { targetOrigin: '*' }
            );
            setCloudStatus(res ? 'saved' : 'error');
            break;
          }

          case 'LOAD_DATA': {
            setCloudStatus('loading');
            const res = await loadGameState(slug);
            event.source?.postMessage(
              {
                source: 'SPIELCADE_WRAPPER',
                type: 'LOAD_DATA_RESPONSE',
                payload: res,
                msgId: event.data.msgId,
              },
              { targetOrigin: '*' }
            );
            setCloudStatus(res ? 'loaded' : 'error');
            break;
          }
        }
      }

      // Generic HTML5 / Poki / CrazyGames fallback events
      try {
        const raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (raw) {
          if (raw.type === 'gameReady' || raw.type === 'loadingStop' || raw.event === 'gameLoaded') {
            setIsIframeLoading(false);
          }
          if (
            raw.type === 'score' ||
            raw.type === 'gameover' ||
            raw.action === 'game_over' ||
            raw.event === 'gameover' ||
            raw.name === 'gameOver'
          ) {
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
              } else {
                const handler = onGameOver || ((sc: number) => submitScore(slug, sc));
                Promise.resolve(handler(score)).catch(() => {
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
  }, [playerState, sourceUrl, children, onGameOver, slug, personalBest, challengerScore, setCloudStatus, title]);

  // Clean up timers on unmount
  useEffect(
    () => () => {
      [
        iframeLoadTimeoutRef,
        cloudSaveTimerRef,
        hudTimerRef,
        scoreToastTimerRef,
        achievementTimerRef,
        shortcutTimerRef,
        favToastTimerRef,
        sessionIntervalRef,
      ].forEach(r => {
        if (r.current) clearTimeout(r.current as any);
      });
    },
    []
  );

  // Mobile Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    resetHudTimer();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (playerState === 'playing') return;
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

  // Screenshot & Gamer Card Engine
  const handleScreenshot = async () => {
    try {
      arcadeAudio.playBlip();
      const iframe = iframeRef.current;
      let gameCanvas: HTMLCanvasElement | null = null;
      try {
        if (iframe?.contentDocument) {
          gameCanvas = iframe.contentDocument.querySelector('canvas');
        }
      } catch {}

      const cardUrl = await generateTradingCardSnapshot({
        gameTitle: title,
        category,
        score: liveScore || personalBest || 0,
        gameImageUrl: image,
        canvasElement: gameCanvas,
      });

      if (cardUrl) {
        setSnapshotCardUrl(cardUrl);
        setIsSnapshotModalOpen(true);
        arcadeAudio.playAchievement();
        setScreenshotToast('success');
      } else {
        setScreenshotToast('hint');
      }
    } catch {
      setScreenshotToast('hint');
    }

    setTimeout(() => setScreenshotToast(null), 3500);
  };

  // Mini-Player Toggle
  const toggleMiniPlayer = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsMiniPlayer(prev => !prev);
    setIsTheater(false);
    refocusGame();
  };

  // Favorite toggle
  const handleToggleFavorite = () => {
    const next = !isFavorited;
    setIsFavorited(next);
    setFavToast(next ? 'added' : 'removed');
    if (favToastTimerRef.current) clearTimeout(favToastTimerRef.current);
    favToastTimerRef.current = setTimeout(() => setFavToast(null), 2500);

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

  // Toolbar Cloud Save Trigger
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
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'SPIELCADE_SAVE_REQUEST',
              action: 'SAVE_STATE',
              slug,
            },
            '*'
          );
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
    arcadeAudio.playSelect();
    setShowBugReportModal(true);
  };

  const isExpandedMode = isTheater || isFullscreen || isWebFullscreen;

  return (
    <div className="w-full flex flex-col select-none relative overflow-x-clip">
      {/* Cinematic GPU Ambient Back-Glow */}
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

      {/* Mini-Player Placeholder */}
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

      {/* Primary Display Canvas */}
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
          playerState === 'playing' ? 'touch-auto' : 'touch-manipulation'
        } ${
          isMiniPlayer
            ? 'fixed bottom-6 right-6 z-[999] w-[340px] sm:w-[420px] aspect-video rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border-2 border-white/20 hidden md:flex'
            : isWebFullscreen
            ? 'fixed inset-0 z-[1000] w-screen h-screen h-[100dvh] rounded-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] overscroll-none'
            : isTheater
            ? 'fixed inset-2 md:inset-6 lg:inset-10 z-[100] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10'
            : `${AR_CLASSES[aspectRatio]} rounded-2xl border border-gray-200 dark:border-white/10`
        }`}
        style={{
          contain: 'layout size paint',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
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
          <div className="fixed inset-0 bg-black/95 z-[-1] backdrop-blur-md" onClick={() => setIsTheater(false)} />
        )}

        <AnimatePresence mode="wait">
          {/* 1. IDLE STATE */}
          {playerState === 'idle' && (
            <PlayerIdleOverlay title={title} image={image} onPlay={handlePlay} />
          )}

          {/* 2. ACTIVE PLAYING CANVAS (100% Pure Edge-to-Edge Canvas like Poki & CrazyGames) */}
          {(playerState === 'playing' || playerState === 'paused') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-row relative z-10 bg-black overflow-hidden"
            >
              {/* Game Viewport Container (STAYS CONSTANT IN DOM) */}
              <div
                className="flex-1 h-full relative flex justify-center items-center pointer-events-auto z-10 min-w-0"
                style={{ touchAction: 'auto' }}
              >
                {sourceUrl ? (
                  <>
                    <iframe
                      key={reloadKey}
                      ref={iframeRef}
                      src={sourceUrl}
                      onLoad={handleIframeLoad}
                      className="absolute inset-0 w-full h-full border-0"
                      style={{ pointerEvents: 'auto', touchAction: 'auto' }}
                      sandbox={GAME_IFRAME_SANDBOX}
                      allow={GAME_IFRAME_PERMISSIONS}
                      title={title}
                    />

                    <PlayerLoadingOverlay
                      title={title}
                      image={image}
                      ambientColor={ambientColor.current}
                      isIframeLoading={isIframeLoading}
                      isMiniPlayer={isMiniPlayer}
                      onDismiss={() => setIsIframeLoading(false)}
                    />
                  </>
                ) : (
                  children
                )}

                {/* 3D Heavy Games: Pointer Lock Cursor Toast */}
                <PlayerPointerLockToast isLocked={isPointerLocked} />

                {/* 3D Heavy Games: WebGL Context Loss Recovery Overlay */}
                {isWebGLContextLost && (
                  <PlayerWebGLRecoveryOverlay
                    onRestore={() => {
                      setIsWebGLContextLost(false);
                      handleReload();
                    }}
                  />
                )}

                <PlayerPauseOverlay
                  title={title}
                  category={category}
                  sessionTime={sessionTime}
                  isPaused={playerState === 'paused'}
                  isMiniPlayer={isMiniPlayer}
                  onResume={togglePause}
                  onRestart={() => {
                    togglePause();
                    handleReload();
                  }}
                />
              </div>

              {/* Score Toasts & Floating Notifications */}
              <PlayerScoreToasts
                isMiniPlayer={isMiniPlayer}
                challenger={challenger}
                challengerScore={challengerScore}
                liveScore={liveScore}
                isNewRecord={isNewRecord}
                showScoreToast={showScoreToast}
                unlockedAchievement={unlockedAchievement}
                shareToast={shareToast}
                favToast={favToast}
                screenshotToast={screenshotToast}
                offlineSyncMsg={offlineSyncMsg}
                resumedCheckpointToast={resumedCheckpointToast}
                cloudSaveStatus={cloudSaveStatus}
              />

              {/* Mobile Portrait Rotation Hint */}
              <PlayerRotateHint
                isVisible={playerState === 'playing' && isPortraitMobile && !dismissRotateHint && aspectRatio !== '9:16'}
                onDismiss={() => setDismissRotateHint(true)}
              />

              {/* Post-Game "Play Next" Continuous Engagement Overlay */}
              {showPlayNext && !isMiniPlayer && (
                <PlayNextOverlay
                  currentSlug={slug}
                  category={category || 'Arcade'}
                  relatedGames={relatedGames}
                  onDismiss={() => setShowPlayNext(false)}
                  onPlayAgain={() => {
                    setPlayerState('playing');
                    setSessionTime(0);
                    handleReload();
                  }}
                />
              )}

              {/* Multi-Touch Virtual Controls Overlay */}
              <AnimatePresence>
                {showVirtualPad && !isMiniPlayer && (
                  <VirtualControlsOverlay
                    onClose={() => setShowVirtualPad(false)}
                    refocusGame={refocusGame}
                    isExternalGame={Boolean(sourceUrl)}
                  />
                )}
              </AnimatePresence>

              {/* Floating In-Game HUD in Expanded Mode */}
              {isExpandedMode && (
                <PlayerImmersiveHUD
                  title={title}
                  sessionTime={sessionTime}
                  isPaused={playerState === 'paused'}
                  isMuted={isMuted}
                  isReloading={isReloading}
                  isTheater={isTheater}
                  isFullscreen={isFullscreen}
                  isWebFullscreen={isWebFullscreen}
                  showVirtualPad={showVirtualPad}
                  isFavorited={isFavorited}
                  shareToast={shareToast}
                  showHud={showHud}
                  onTogglePause={togglePause}
                  onReload={handleReload}
                  onToggleMute={handleToggleMute}
                  onToggleTheater={() => {
                    setIsTheater(false);
                    refocusGame();
                  }}
                  onToggleFullscreen={toggleFullscreen}
                  onToggleVirtualPad={() => {
                    setShowVirtualPad(p => !p);
                    refocusGame();
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  onShare={handleShare}
                  onExitImmersive={() => {
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    setIsFullscreen(false);
                    setIsWebFullscreen(false);
                    setIsTheater(false);
                  }}
                />
              )}
            </motion.div>
          )}

          {/* 4. GAME OVER STATE */}
          {playerState === 'game_over' && (
            <PlayerGameOverScreen
              liveScore={liveScore}
              isNewRecord={isNewRecord}
              sessionTime={sessionTime}
              personalBest={personalBest}
              relatedGames={relatedGames}
              onPlayAgain={() => {
                setPlayerState('playing');
                setSessionTime(0);
                refocusGame();
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Docked Pro Control Deck (Standard View) */}
      {!isTheater && !isFullscreen && !isWebFullscreen && (
        <PlayerControlDeck
          title={title}
          image={image}
          category={category}
          playerState={playerState}
          sessionTime={sessionTime}
          personalBest={personalBest}
          isReloading={isReloading}
          isMuted={isMuted}
          volume={volume}
          showVirtualPad={showVirtualPad}
          aspectRatio={aspectRatio}
          isTheater={isTheater}
          isMiniPlayer={isMiniPlayer}
          isFavorited={isFavorited}
          isPendingFav={isPendingFav}
          shareToast={shareToast}
          cloudSaveStatus={cloudSaveStatus}
          hasBeatenChallenge={hasBeatenChallenge}
          isNewRecord={isNewRecord}
          onTogglePause={togglePause}
          onReload={handleReload}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          onToggleFullscreen={toggleFullscreen}
          onToggleVirtualPad={() => {
            setShowVirtualPad(p => !p);
            refocusGame();
          }}
          onSelectAspectRatio={handleSelectAspectRatio}
          onToggleTheater={() => {
            setIsTheater(!isTheater);
            refocusGame();
          }}
          onToggleMiniPlayer={toggleMiniPlayer}
          onScreenshot={handleScreenshot}
          onOpenMixtape={() => {
            arcadeAudio.playSelect();
            setIsMixtapeModalOpen(true);
          }}
          onOpenShortcuts={() => setShowShortcuts(p => !p)}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShare}
          onToolbarCloudSave={handleToolbarCloudSave}
          onOpenChallenge={() => {
            arcadeAudio.playBlip();
            setShowChallengeModal(true);
          }}
          onPlayNext={() => setShowPlayNext(true)}
          onReportBug={handleReport}
        />
      )}

      {/* Dedicated In-Player Cloud Save Control Bar */}
      <CloudSaveBar slug={slug} title={title} iframeRef={iframeRef} className="mt-4" />

      {/* High-Score Viral Challenge Modal */}
      <ScoreChallengeModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        slug={slug}
        gameTitle={title}
        gameImage={image}
        currentScore={liveScore || personalBest || 1500}
      />

      {/* In-Game Player Bug Diagnostic Modal */}
      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
        gameSlug={slug}
        gameTitle={title}
        sessionDurationSec={sessionTime}
        currentScore={liveScore || personalBest}
      />

      {/* Universal Physical Hardware Gamepad HUD */}
      <GamepadHUD />

      {/* Instant Trading Card Snapshot & Clip Studio Modal */}
      {snapshotCardUrl && (
        <ClipRecorderModal
          isOpen={isSnapshotModalOpen}
          onClose={() => setIsSnapshotModalOpen(false)}
          imageUrl={snapshotCardUrl}
          gameTitle={title}
          score={liveScore || personalBest || 0}
        />
      )}

      {/* Custom Arcade Mixtape Modal */}
      <MixtapeModal
        isOpen={isMixtapeModalOpen}
        onClose={() => setIsMixtapeModalOpen(false)}
        gameSlug={slug}
        gameTitle={title}
      />

      {/* Controls & Gamepad Guide Modal */}
      <PlayerKeyboardGuide
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        onFocusGame={refocusGame}
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
