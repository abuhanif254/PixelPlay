'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  MonitorX,
  Gamepad2,
  Heart,
  Share2,
  Check,
  X,
  Smartphone,
  Loader2,
  Timer,
  MousePointer,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdBanner from '@/components/AdBanner';
import { PlayerState, AspectRatio, fmtTime } from './types';

// 1. Idle Overlay
export interface PlayerIdleOverlayProps {
  title: string;
  image?: string;
  onPlay: () => void;
}

export function PlayerIdleOverlay({ title, image, onPlay }: PlayerIdleOverlayProps) {
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 group cursor-pointer"
      onClick={onPlay}
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
            onPlay();
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
  );
}

// 2. Pre-roll Ad Overlay
export interface PlayerAdOverlayProps {
  title: string;
  adCountdown: number;
  onSkipAd: () => void;
}

export function PlayerAdOverlay({ title, adCountdown, onSkipAd }: PlayerAdOverlayProps) {
  return (
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
            onClick={onSkipAd}
            className="px-5 py-2 sm:px-6 sm:py-2.5 bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 rounded-full text-xs sm:text-sm font-bold shadow-2xl transition-all flex items-center gap-2"
          >
            Play Now <Play size={14} className="fill-black" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// 3. Rewarded Ad Overlay
export interface PlayerRewardedAdOverlayProps {
  adCountdown: number;
  onCompleteRewardedAd: () => void;
}

export function PlayerRewardedAdOverlay({ adCountdown, onCompleteRewardedAd }: PlayerRewardedAdOverlayProps) {
  return (
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
            onClick={onCompleteRewardedAd}
            className="px-6 py-2.5 bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 active:scale-95 rounded-full text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all flex items-center gap-2"
          >
            Claim Reward <Play size={14} className="fill-black" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// 4. Iframe Loading Overlay
export interface PlayerLoadingOverlayProps {
  title: string;
  image?: string;
  ambientColor: string;
  isIframeLoading: boolean;
  isMiniPlayer: boolean;
  onDismiss: () => void;
}

export function PlayerLoadingOverlay({
  title,
  image,
  ambientColor,
  isIframeLoading,
  isMiniPlayer,
  onDismiss,
}: PlayerLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isIframeLoading && !isMiniPlayer && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss}
          onTouchStart={onDismiss}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950 cursor-pointer"
        >
          {image && (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110 pointer-events-none"
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4 pointer-events-none">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: `${ambientColor} transparent transparent transparent` }}
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
                  background: `linear-gradient(90deg, transparent 0%, ${ambientColor} 50%, transparent 100%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }}
              />
            </div>
            <p className="text-white/40 text-[10px] mt-1 select-none">Tap anywhere to play</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 5. Pause Screen Overlay
export interface PlayerPauseOverlayProps {
  title: string;
  category?: string;
  sessionTime: number;
  isPaused: boolean;
  isMiniPlayer: boolean;
  onResume: () => void;
  onRestart: () => void;
}

export function PlayerPauseOverlay({
  title,
  category,
  sessionTime,
  isPaused,
  isMiniPlayer,
  onResume,
  onRestart,
}: PlayerPauseOverlayProps) {
  return (
    <AnimatePresence>
      {isPaused && !isMiniPlayer && (
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
              <p className="text-xs text-gray-400 mt-0.5">
                {title} {category ? `• ${category}` : ''}
              </p>
            </div>

            {sessionTime > 0 && (
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                <Timer size={13} /> <span>Session Time: {fmtTime(sessionTime)}</span>
              </div>
            )}

            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                onClick={onResume}
                className="w-full py-2.5 bg-[#6366F1] hover:bg-[#5356e8] text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Play size={14} className="fill-white" /> Resume (P)
              </button>
              <button
                onClick={onRestart}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> Restart Run
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 6. Mobile Rotate Hint Banner
export interface PlayerRotateHintProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function PlayerRotateHint({ isVisible, onDismiss }: PlayerRotateHintProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-3 inset-x-3 sm:inset-x-6 z-40 bg-slate-950/90 border border-white/20 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xl backdrop-blur-md pointer-events-auto"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Smartphone className="w-4 h-4 text-indigo-400 rotate-90 animate-pulse shrink-0" />
            <span>Rotate device for full cinema widescreen</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-white/60 hover:text-white rounded-lg transition-colors ml-2 shrink-0"
            aria-label="Dismiss rotation hint"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 7. Floating In-Game HUD (Auto-Hiding in Immersive Modes)
export interface PlayerImmersiveHUDProps {
  title: string;
  sessionTime: number;
  isPaused: boolean;
  isMuted: boolean;
  isReloading: boolean;
  isTheater: boolean;
  isFullscreen: boolean;
  isWebFullscreen: boolean;
  showVirtualPad: boolean;
  isFavorited: boolean;
  shareToast: boolean;
  showHud: boolean;
  onTogglePause: () => void;
  onReload: () => void;
  onToggleMute: () => void;
  onToggleTheater: () => void;
  onToggleFullscreen: () => void;
  onToggleVirtualPad: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onExitImmersive: () => void;
}

export function PlayerImmersiveHUD({
  title,
  sessionTime,
  isPaused,
  isMuted,
  isReloading,
  isTheater,
  isFullscreen,
  isWebFullscreen,
  showVirtualPad,
  isFavorited,
  shareToast,
  showHud,
  onTogglePause,
  onReload,
  onToggleMute,
  onToggleTheater,
  onToggleFullscreen,
  onToggleVirtualPad,
  onToggleFavorite,
  onShare,
  onExitImmersive,
}: PlayerImmersiveHUDProps) {
  return (
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
              onClick={onTogglePause}
              className="text-white/80 hover:text-white hover:scale-110 transition-all"
              title={isPaused ? 'Resume (P)' : 'Pause (P)'}
              aria-label="Toggle Pause"
            >
              {isPaused ? <Play size={17} className="fill-white" /> : <Pause size={17} />}
            </button>

            {/* Reload */}
            <button
              onClick={onReload}
              className="text-white/80 hover:text-white hover:scale-110 transition-all"
              title="Restart (R)"
              aria-label="Restart Game"
            >
              <RotateCcw size={17} className={isReloading ? 'animate-spin text-[#6366F1]' : ''} />
            </button>

            {/* Mute */}
            <button
              onClick={onToggleMute}
              className="text-white/80 hover:text-white hover:scale-110 transition-all"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              aria-label="Toggle Mute"
            >
              {isMuted ? <VolumeX size={17} className="text-red-400" /> : <Volume2 size={17} />}
            </button>

            {isTheater && (
              <button
                onClick={onToggleTheater}
                className="text-[#6366F1] hover:text-white hover:scale-110 transition-all"
                title="Exit Theater (T)"
                aria-label="Exit Theater"
              >
                <MonitorX size={17} />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={onToggleFullscreen}
              className="text-white/80 hover:text-white hover:scale-110 transition-all"
              title={isFullscreen || isWebFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen || isWebFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            {/* Virtual Gamepad Toggle (Fullscreen / Theater HUD) */}
            <button
              onClick={onToggleVirtualPad}
              className={`hover:scale-110 transition-all ${
                showVirtualPad ? 'text-[#6366F1]' : 'text-white/80 hover:text-white'
              }`}
              title={showVirtualPad ? 'Hide Virtual Gamepad' : 'Show Virtual Gamepad'}
              aria-label="Toggle Virtual Gamepad"
            >
              <Gamepad2 size={17} />
            </button>

            <div className="w-px h-5 bg-white/15" />

            {/* Favorite */}
            <button
              onClick={onToggleFavorite}
              className={`hover:scale-110 transition-all ${
                isFavorited ? 'text-red-500' : 'text-white/80 hover:text-white'
              }`}
              title="Favorite"
              aria-label="Favorite Game"
            >
              <Heart size={17} className={isFavorited ? 'fill-red-500' : ''} />
            </button>

            {/* Share */}
            <button
              onClick={onShare}
              className="text-white/80 hover:text-white hover:scale-110 transition-all"
              title="Share"
              aria-label="Share Game"
            >
              {shareToast ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
            </button>

            {/* Exit button */}
            <button
              onClick={onExitImmersive}
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 transition-colors ml-1"
              title="Exit Immersive Mode (Esc)"
              aria-label="Exit Immersive Mode"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 8. 3D Pointer Lock Toast Indicator
export interface PlayerPointerLockToastProps {
  isLocked: boolean;
}

export function PlayerPointerLockToast({ isLocked }: PlayerPointerLockToastProps) {
  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[90] pointer-events-none"
        >
          <div className="bg-black/90 text-white border border-white/20 px-4 py-2 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold">
            <MousePointer size={14} className="text-[#6366F1] animate-pulse" />
            <span>Mouse locked</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-gray-300">
              Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded font-mono text-[10px] text-white font-bold">ESC</kbd> to unlock
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 9. WebGL Context Loss Recovery Overlay (3D GPU Memory Purge Protection)
export interface PlayerWebGLRecoveryOverlayProps {
  onRestore: () => void;
}

export function PlayerWebGLRecoveryOverlay({ onRestore }: PlayerWebGLRecoveryOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 text-center"
    >
      <div className="bg-[#111228]/95 border border-amber-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <RefreshCw size={24} className="animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white font-outfit">Graphics Memory Restored</h3>
          <p className="text-xs text-gray-400 mt-1">
            Your browser freed 3D graphics memory while in the background. Tap below to resume your game instantly.
          </p>
        </div>
        <button
          onClick={onRestore}
          className="w-full py-2.5 bg-[#6366F1] hover:bg-[#5356e8] text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <Play size={14} className="fill-white" /> Resume Game
        </button>
      </div>
    </motion.div>
  );
}
