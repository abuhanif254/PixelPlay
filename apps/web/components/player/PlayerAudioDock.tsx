'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PlayerAudioDockProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (newVol: number) => void;
  className?: string;
  buttonClassName?: string;
}

export default function PlayerAudioDock({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  className = '',
  buttonClassName = '',
}: PlayerAudioDockProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeMenuRef = useRef<HTMLDivElement>(null);

  // Close volume popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (volumeMenuRef.current && !volumeMenuRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={volumeMenuRef}>
      <button
        onClick={onToggleMute}
        onMouseEnter={() => setShowVolumeSlider(true)}
        className={
          buttonClassName ||
          'p-2 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold'
        }
        title={isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
        aria-label="Toggle Sound"
      >
        {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
      </button>

      <AnimatePresence>
        {showVolumeSlider && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 right-0 z-50 bg-white dark:bg-[#1a1b38] border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-2xl w-36 flex flex-col gap-2"
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
              onChange={e => onVolumeChange(Number(e.target.value))}
              className="w-full accent-[#6366F1] cursor-pointer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
