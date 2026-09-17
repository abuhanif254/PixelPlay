'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Pause,
  RotateCcw,
  Maximize2,
  Gamepad2,
  LayoutTemplate,
  Monitor,
  Pin,
  PinOff,
  Camera,
  ListPlus,
  HelpCircle,
  Heart,
  Share2,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  Swords,
  Sparkles,
  MoreHorizontal,
  SlidersHorizontal,
  Flag,
  Timer,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PerformanceToggle from '@/components/PerformanceToggle';
import PlayerAudioDock from './PlayerAudioDock';
import { PlayerState, AspectRatio, CloudSaveStatus, fmtTime } from './types';

export interface PlayerControlDeckProps {
  title: string;
  image?: string;
  category?: string;
  playerState: PlayerState;
  sessionTime: number;
  personalBest: number | null;
  isReloading: boolean;
  isMuted: boolean;
  volume: number;
  showVirtualPad: boolean;
  aspectRatio: AspectRatio;
  isTheater: boolean;
  isMiniPlayer: boolean;
  isFavorited: boolean;
  isPendingFav: boolean;
  shareToast: boolean;
  cloudSaveStatus: CloudSaveStatus;
  hasBeatenChallenge: boolean;
  isNewRecord: boolean;
  onTogglePause: () => void;
  onReload: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleFullscreen: () => void;
  onToggleVirtualPad: () => void;
  onSelectAspectRatio: (ar: AspectRatio) => void;
  onToggleTheater: () => void;
  onToggleMiniPlayer: () => void;
  onScreenshot: () => void;
  onOpenMixtape: () => void;
  onOpenShortcuts: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onToolbarCloudSave: () => void;
  onOpenChallenge: () => void;
  onPlayNext: () => void;
  onReportBug: () => void;
}

export default function PlayerControlDeck({
  title,
  image,
  category,
  playerState,
  sessionTime,
  personalBest,
  isReloading,
  isMuted,
  volume,
  showVirtualPad,
  aspectRatio,
  isTheater,
  isMiniPlayer,
  isFavorited,
  isPendingFav,
  shareToast,
  cloudSaveStatus,
  hasBeatenChallenge,
  isNewRecord,
  onTogglePause,
  onReload,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  onToggleVirtualPad,
  onSelectAspectRatio,
  onToggleTheater,
  onToggleMiniPlayer,
  onScreenshot,
  onOpenMixtape,
  onOpenShortcuts,
  onToggleFavorite,
  onShare,
  onToolbarCloudSave,
  onOpenChallenge,
  onPlayNext,
  onReportBug,
}: PlayerControlDeckProps) {
  const [showProTools, setShowProTools] = useState(false);
  const proToolsRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (proToolsRef.current && !proToolsRef.current.contains(e.target as Node)) {
        setShowProTools(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="w-full mt-3 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-center justify-between gap-2 sm:gap-3 transition-colors">
      {/* Left: Identity + Category + Live Stats */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-white/10 hidden xs:block shadow-sm"
          />
        )}
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate font-outfit">{title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#6366F1]">{category}</span>
            )}
            {playerState === 'playing' && sessionTime > 0 && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1">
                <Timer size={10} /> {fmtTime(sessionTime)}
              </span>
            )}
            {personalBest && (
              <span className="text-[10px] sm:text-[11px] text-amber-500 font-bold hidden sm:flex items-center gap-1">
                <Award size={11} /> {personalBest.toLocaleString()} pts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Poki / CrazyGames Grade Tier-1 Primary Action Suite */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* 1. Quick Like / Favorite */}
        <button
          onClick={onToggleFavorite}
          disabled={isPendingFav}
          className={`p-2 min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 ${
            isFavorited
              ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
              : 'text-gray-700 dark:text-gray-300 hover:text-red-500 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
          title={isFavorited ? 'Favorited' : 'Add to Favorites'}
          aria-label="Favorite Game"
        >
          <Heart size={15} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
        </button>

        {/* 2. Share Game */}
        <button
          onClick={onShare}
          className="p-2 min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95"
          title="Share Game & Score"
          aria-label="Share Game"
        >
          {shareToast ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
        </button>

        {/* 3. Audio Dock (Mute + Volume slider popover) */}
        <PlayerAudioDock
          isMuted={isMuted}
          volume={volume}
          onToggleMute={onToggleMute}
          onVolumeChange={onVolumeChange}
        />

        {/* 4. Theater Mode (CrazyGames Style Viewport Expansion) */}
        <button
          onClick={onToggleTheater}
          className={`hidden md:flex p-2 rounded-xl transition-all items-center gap-1.5 text-xs font-semibold cursor-pointer ${
            isTheater
              ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
          title="Theater Mode (T)"
          aria-label="Toggle Theater Mode"
        >
          <Monitor size={15} />
        </button>

        {/* 5. Controls & Shortcuts Guide */}
        <button
          onClick={onOpenShortcuts}
          className="hidden sm:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
          title="Controls & Shortcuts (?)"
          aria-label="Open Keyboard Shortcuts Guide"
        >
          <HelpCircle size={15} />
        </button>

        {/* 6. Virtual Gamepad Toggle (Promoted on touch devices) */}
        {playerState === 'playing' && (
          <button
            onClick={onToggleVirtualPad}
            className={`flex p-2 min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl transition-all items-center gap-1.5 text-xs font-semibold cursor-pointer sm:hidden ${
              showVirtualPad
                ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
            title="Toggle Touch Gamepad"
            aria-label="Toggle Touch Gamepad"
          >
            <Gamepad2 size={16} />
          </button>
        )}

        {/* 7. Fullscreen Hero CTA (High Visibility Poki / CrazyGames Standard) */}
        <button
          onClick={onToggleFullscreen}
          className="px-3 sm:px-3.5 py-2 min-h-[40px] sm:min-h-[36px] bg-[#6366F1] hover:bg-[#5356e8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#6366F1]/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Fullscreen (F)"
          aria-label="Toggle Fullscreen"
        >
          <Maximize2 size={15} />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

        {/* 8. Pro Tools Drawer Trigger */}
        <div className="relative" ref={proToolsRef}>
          <button
            onClick={() => setShowProTools(p => !p)}
            className={`p-2 min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              showProTools
                ? 'bg-[#6366F1] text-white'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
            title="Pro Tools & Settings"
            aria-label="Pro Tools & Settings"
          >
            <SlidersHorizontal size={15} />
          </button>

          <AnimatePresence>
            {showProTools && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-2 right-0 z-50 bg-white dark:bg-[#1a1b38] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] p-2 flex flex-col gap-1"
              >
                {/* Header Badge */}
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100 dark:border-white/5 mb-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 dark:text-gray-500">
                    Pro Gaming Tools
                  </span>
                  {cloudSaveStatus !== 'idle' && (
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <Cloud size={10} /> {cloudSaveStatus}
                    </span>
                  )}
                </div>

                {/* Aspect Ratio Switcher */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl mb-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <LayoutTemplate size={12} /> Aspect Ratio
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['16:9', '4:3', '9:16', 'auto'] as AspectRatio[]).map(ar => (
                      <button
                        key={ar}
                        onClick={() => {
                          onSelectAspectRatio(ar);
                          setShowProTools(false);
                        }}
                        className={`px-1.5 py-1 rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer ${
                          aspectRatio === ar
                            ? 'bg-[#6366F1] text-white shadow-sm'
                            : 'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Viral Challenge */}
                <button
                  onClick={() => {
                    onOpenChallenge();
                    setShowProTools(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                >
                  <Swords size={15} className="text-rose-500 shrink-0" />
                  <span>{hasBeatenChallenge ? '⚔️ Counter-Challenge!' : isNewRecord ? '⚔️ Challenge Now!' : 'Challenge a Friend'}</span>
                </button>

                {/* Cloud Save Checkpoint */}
                <button
                  onClick={() => {
                    onToolbarCloudSave();
                    setShowProTools(false);
                  }}
                  disabled={cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading'}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  {cloudSaveStatus === 'saving' ? (
                    <Loader2 size={15} className="animate-spin text-[#6366F1]" />
                  ) : cloudSaveStatus === 'saved' ? (
                    <Cloud size={15} className="text-emerald-500" />
                  ) : cloudSaveStatus === 'error' ? (
                    <CloudOff size={15} className="text-rose-500" />
                  ) : (
                    <Cloud size={15} />
                  )}
                  <span>{cloudSaveStatus === 'saved' ? 'Cloud Synced' : 'Cloud Save Checkpoint'}</span>
                </button>

                {/* Virtual Touch Gamepad */}
                <button
                  onClick={() => {
                    onToggleVirtualPad();
                    setShowProTools(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <Gamepad2 size={15} className={showVirtualPad ? 'text-[#6366F1]' : ''} />
                  <span>{showVirtualPad ? 'Hide Virtual Touch Gamepad' : 'Show Virtual Touch Gamepad'}</span>
                </button>

                {/* Screenshot & Gamer Card Studio */}
                {(playerState === 'playing' || playerState === 'paused') && (
                  <button
                    onClick={() => {
                      onScreenshot();
                      setShowProTools(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
                  >
                    <Camera size={15} />
                    <span>Take Gameplay Snapshot</span>
                  </button>
                )}

                {/* Picture-in-Picture Mini Player */}
                {(playerState === 'playing' || playerState === 'paused') && (
                  <button
                    onClick={() => {
                      onToggleMiniPlayer();
                      setShowProTools(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer hidden md:flex"
                  >
                    {isMiniPlayer ? <PinOff size={15} /> : <Pin size={15} />}
                    <span>{isMiniPlayer ? 'Unpin Mini-Player' : 'Pin to Corner (Mini-Player)'}</span>
                  </button>
                )}

                {/* Low-Spec Turbo Mode & FPS */}
                <div className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <span className="text-gray-700 dark:text-gray-300">Performance & FPS</span>
                  <PerformanceToggle showFps={true} />
                </div>

                {/* Add to Mixtape */}
                <button
                  onClick={() => {
                    onOpenMixtape();
                    setShowProTools(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <ListPlus size={15} />
                  <span>Add to Custom Mixtape</span>
                </button>

                {/* Mobile Controls Guide trigger */}
                <button
                  onClick={() => {
                    onOpenShortcuts();
                    setShowProTools(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer sm:hidden"
                >
                  <HelpCircle size={15} />
                  <span>Keyboard Shortcuts & Controls</span>
                </button>

                {/* Play Next Game */}
                <button
                  onClick={() => {
                    onPlayNext();
                    setShowProTools(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-[#6366F1] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors text-left cursor-pointer"
                >
                  <Sparkles size={15} className="text-yellow-400" />
                  <span>Play Next Game</span>
                </button>

                <div className="h-px bg-gray-100 dark:bg-white/5 my-0.5" />

                {/* Report an Issue */}
                <button
                  onClick={() => {
                    onReportBug();
                    setShowProTools(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
                >
                  <Flag size={15} />
                  <span>Report an Issue</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
