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
  const [showArMenu, setShowArMenu] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const overflowMenuRef = useRef<HTMLDivElement>(null);
  const arMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
      if (arMenuRef.current && !arMenuRef.current.contains(e.target as Node)) {
        setShowArMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
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
            onClick={onTogglePause}
            className="p-2 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Pause Game (P)"
            aria-label="Pause Game"
          >
            <Pause size={15} />
            <span className="hidden xl:inline">Pause</span>
          </button>
        )}

        {/* Restart */}
        <button
          onClick={onReload}
          disabled={isReloading}
          className="p-2 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Restart Game (R)"
          aria-label="Restart Game"
        >
          <RotateCcw size={15} className={isReloading ? 'animate-spin text-[#6366F1]' : ''} />
          <span className="hidden xl:inline">Restart</span>
        </button>

        {/* Isolated Audio Dock */}
        <PlayerAudioDock
          isMuted={isMuted}
          volume={volume}
          onToggleMute={onToggleMute}
          onVolumeChange={onVolumeChange}
        />

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Fullscreen (F)"
          aria-label="Fullscreen"
        >
          <Maximize2 size={15} />
          <span className="hidden xl:inline">Fullscreen</span>
        </button>

        {/* Virtual Gamepad Toggle (Promoted to mobile toolbar for instant thumb access) */}
        {playerState === 'playing' && (
          <button
            onClick={onToggleVirtualPad}
            className={`flex p-2 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl transition-all items-center gap-1.5 text-xs font-semibold ${
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
        <div className="hidden sm:block relative" ref={arMenuRef}>
          <button
            onClick={() => setShowArMenu(p => !p)}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Aspect Ratio"
            aria-label="Select Aspect Ratio"
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
                      onSelectAspectRatio(ar);
                      setShowArMenu(false);
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
          onClick={onToggleTheater}
          className={`hidden md:flex p-2 rounded-xl transition-all items-center gap-1.5 text-xs font-semibold ${
            isTheater
              ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
          title="Theater Mode (T)"
          aria-label="Toggle Theater Mode"
        >
          <Monitor size={15} />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

        {/* Tier 3: Pro Tools (Mini-Player Pin, Screenshot, Help) */}

        {/* Mini-Player Pin Button */}
        {(playerState === 'playing' || playerState === 'paused') && (
          <button
            onClick={onToggleMiniPlayer}
            className={`hidden md:flex p-2 rounded-xl transition-all ${
              isMiniPlayer
                ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                : 'text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
            title={isMiniPlayer ? 'Unpin Mini-Player' : 'Pin to Corner (Mini-Player)'}
            aria-label="Toggle Mini-Player"
          >
            {isMiniPlayer ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
        )}

        {/* Screenshot */}
        {(playerState === 'playing' || playerState === 'paused') && (
          <button
            onClick={onScreenshot}
            className="hidden md:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            title="Save Gameplay Snapshot (Camera)"
            aria-label="Take Screenshot"
          >
            <Camera size={15} />
          </button>
        )}

        {/* Add to Custom Mixtape */}
        <button
          onClick={onOpenMixtape}
          className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-pink-500 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          title="Add to Custom Mixtape"
          aria-label="Add to Custom Mixtape"
        >
          <ListPlus size={15} />
        </button>

        {/* Low-Spec Turbo Mode & Live FPS Monitor */}
        <div className="hidden sm:flex items-center">
          <PerformanceToggle showFps={true} />
        </div>

        {/* Shortcuts Guide */}
        <button
          onClick={onOpenShortcuts}
          className="hidden md:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          title="Keyboard Shortcuts (?)"
          aria-label="Open Keyboard Shortcuts Guide"
        >
          <HelpCircle size={15} />
        </button>

        {/* Social & Save Tools */}
        <button
          onClick={onToggleFavorite}
          disabled={isPendingFav}
          className={`hidden sm:flex p-2 rounded-xl transition-all ${
            isFavorited
              ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
              : 'text-gray-700 dark:text-gray-300 hover:text-red-500 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
          title={isFavorited ? 'Favorited' : 'Add to Favorites'}
          aria-label="Favorite Game"
        >
          <Heart size={15} className={isFavorited ? 'fill-red-500' : ''} />
        </button>

        <button
          onClick={onShare}
          className="hidden sm:flex p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          title="Share Game & Score"
          aria-label="Share Game"
        >
          {shareToast ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
        </button>

        {/* Cloud Save Button */}
        <button
          onClick={onToolbarCloudSave}
          disabled={cloudSaveStatus === 'saving' || cloudSaveStatus === 'loading'}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            cloudSaveStatus === 'saved'
              ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20'
              : cloudSaveStatus === 'saving'
              ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20'
              : 'text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
          title={cloudSaveStatus === 'saved' ? 'Cloud Save Synced!' : 'Save Progress to Cloud'}
          aria-label="Cloud Save"
        >
          <Cloud size={15} className={cloudSaveStatus === 'saving' ? 'animate-spin text-[#6366F1]' : ''} />
          <span className="hidden md:inline">
            {cloudSaveStatus === 'saving' ? 'Saving...' : cloudSaveStatus === 'saved' ? 'Synced' : 'Cloud Save'}
          </span>
        </button>

        {/* Viral Challenge Button */}
        <button
          onClick={onOpenChallenge}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0 ${
            hasBeatenChallenge
              ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/50 animate-pulse'
              : isNewRecord
              ? 'ring-2 ring-pink-400 shadow-lg shadow-pink-500/50 animate-pulse'
              : 'shadow-md shadow-pink-500/20'
          }`}
          title="Challenge a Friend to beat your score!"
          aria-label="Challenge a Friend"
        >
          <Swords size={14} className="text-yellow-300" />
          <span>{hasBeatenChallenge ? '⚔️ Counter-Challenge!' : isNewRecord ? '⚔️ Challenge Now!' : 'Challenge'}</span>
        </button>

        {/* Play Next Button */}
        <button
          onClick={onPlayNext}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#6366F1] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
          title="Play Next Game"
          aria-label="Play Next Game"
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
            aria-label="More Options"
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
                    onPlayNext();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                >
                  <Sparkles size={14} className="text-yellow-400" /> Play Next Game
                </button>

                {/* Challenge (Mobile) */}
                <button
                  onClick={() => {
                    onOpenChallenge();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-black flex items-center gap-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <Swords size={14} className="text-rose-500" /> Challenge a Friend
                </button>

                {/* Cloud Save (Mobile) */}
                <button
                  onClick={() => {
                    onToolbarCloudSave();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                >
                  <Cloud size={14} /> Cloud Save Progress
                </button>

                {/* Favorite (Mobile) */}
                <button
                  onClick={() => {
                    onToggleFavorite();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                >
                  <Heart size={14} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />{' '}
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </button>

                {/* Share (Mobile) */}
                <button
                  onClick={() => {
                    onShare();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                >
                  <Share2 size={14} /> Share Game & Score
                </button>

                {/* Aspect Ratio Selector (Direct inline picker for mobile) */}
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5 sm:hidden">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <LayoutTemplate size={12} /> Aspect Ratio
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['16:9', '4:3', '9:16', 'auto'] as AspectRatio[]).map(ar => (
                      <button
                        key={ar}
                        onClick={() => {
                          onSelectAspectRatio(ar);
                          setShowOverflowMenu(false);
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
                    onToggleVirtualPad();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors sm:hidden"
                >
                  <Gamepad2 size={14} /> {showVirtualPad ? 'Hide Gamepad' : 'Show Gamepad'}
                </button>

                {/* Theater */}
                <button
                  onClick={() => {
                    onToggleTheater();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden"
                >
                  <Monitor size={14} /> {isTheater ? 'Exit Theater' : 'Theater Mode'}
                </button>

                {/* Screenshot */}
                <button
                  onClick={() => {
                    onScreenshot();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden"
                >
                  <Camera size={14} /> Take Screenshot
                </button>

                {/* Add to Mixtape */}
                <button
                  onClick={() => {
                    onOpenMixtape();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors md:hidden"
                >
                  <ListPlus size={14} /> Add to Mixtape
                </button>

                {/* Mini-Player Pin */}
                {(playerState === 'playing' || playerState === 'paused') && (
                  <button
                    onClick={() => {
                      onToggleMiniPlayer();
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
                    onOpenShortcuts();
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
                    onReportBug();
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
  );
}
