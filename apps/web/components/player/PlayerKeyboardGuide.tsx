'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Gamepad2,
  Keyboard,
  Zap,
  CheckCircle2,
  MousePointer,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHORTCUTS } from './types';
import { gamepadEngine, GamepadInfo } from '@/lib/gamepad-engine';

export interface PlayerKeyboardGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusGame?: () => void;
}

export default function PlayerKeyboardGuide({
  isOpen,
  onClose,
  onFocusGame,
}: PlayerKeyboardGuideProps) {
  const [activeTab, setActiveTab] = useState<'controls' | 'shortcuts' | 'gamepad'>('controls');
  const [connectedGamepad, setConnectedGamepad] = useState<GamepadInfo | null>(null);
  const [isRumbling, setIsRumbling] = useState(false);

  // Subscribe to physical hardware gamepad status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsub = gamepadEngine.subscribe((_state, info) => {
      setConnectedGamepad(info);
    });

    // Initial check
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gps = navigator.getGamepads();
      for (let i = 0; i < gps.length; i++) {
        if (gps[i] && gps[i]?.connected) {
          const brand = (gps[i]!.id || '').toLowerCase().includes('xbox')
            ? 'xbox'
            : (gps[i]!.id || '').toLowerCase().includes('playstation') || (gps[i]!.id || '').toLowerCase().includes('dual')
            ? 'playstation'
            : (gps[i]!.id || '').toLowerCase().includes('switch')
            ? 'switch'
            : 'generic';
          setConnectedGamepad({
            id: gps[i]!.id,
            brand,
            index: i,
            connected: true,
          });
          break;
        }
      }
    }

    return () => unsub();
  }, []);

  const handleTestRumble = () => {
    setIsRumbling(true);
    gamepadEngine.vibrate(0.6, 0.8, 300);
    setTimeout(() => setIsRumbling(false), 350);
  };

  const handleFocusAndClose = () => {
    onClose();
    if (onFocusGame) {
      setTimeout(() => onFocusGame(), 60);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="controls-guide-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-[#111228] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-w-md w-full flex flex-col gap-4 text-white select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center">
                  <Gamepad2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-outfit">Game Controls & Hardware</h3>
                  <p className="text-[11px] text-gray-400">Poki & CrazyGames High-Precision Standard</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close controls guide"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('controls')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'controls'
                    ? 'bg-[#6366F1] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Keyboard size={13} />
                <span>Controls</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gamepad')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'gamepad'
                    ? 'bg-[#6366F1] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gamepad2 size={13} />
                <span className="flex items-center gap-1">
                  Controller
                  {connectedGamepad && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('shortcuts')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'shortcuts'
                    ? 'bg-[#6366F1] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle size={13} />
                <span>Hotkeys</span>
              </button>
            </div>

            {/* Tab 1: In-Game Controls */}
            {activeTab === 'controls' && (
              <div className="space-y-3">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-300">Drive / Move</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        {['W', 'A', 'S', 'D'].map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-[11px] font-mono font-bold"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                      <span className="text-gray-500 text-xs font-bold">or</span>
                      <div className="flex gap-1">
                        {['↑', '←', '↓', '→'].map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-[11px] font-mono font-bold"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300">Brake / Jump / Action</span>
                    <kbd className="px-3 py-0.5 bg-white/10 border border-white/20 rounded text-[11px] font-mono font-bold">
                      SPACE
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300">Nitro / Turbo / Dash</span>
                    <kbd className="px-3 py-0.5 bg-white/10 border border-white/20 rounded text-[11px] font-mono font-bold">
                      SHIFT
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300">Camera / Look / Aim</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <MousePointer size={12} className="text-[#6366F1]" /> Mouse Look
                    </span>
                  </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 flex items-start gap-2">
                  <Zap size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-200/90 leading-tight">
                    <strong>Pro Tip:</strong> Click the game canvas anytime to instantly lock mouse focus and play with 0 input lag.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Hardware Controller / Gamepad */}
            {activeTab === 'gamepad' && (
              <div className="space-y-3">
                {connectedGamepad ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Controller Active</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize font-outfit text-white">
                        {connectedGamepad.brand} Controller Connected
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-xs">{connectedGamepad.id}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleTestRumble}
                        disabled={isRumbling}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Zap size={12} className={isRumbling ? 'animate-bounce' : ''} />
                        <span>{isRumbling ? 'Rumbling...' : 'Test Rumble Feedback'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 text-gray-400 flex items-center justify-center mx-auto">
                      <Gamepad2 size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-300">No Physical Controller Detected</p>
                    <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                      Connect an Xbox, PlayStation DualSense, Nintendo Switch Pro, or Bluetooth controller. It works automatically with zero drivers needed!
                    </p>
                  </div>
                )}

                <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1.5 text-[11px] text-gray-400">
                  <div className="flex justify-between">
                    <span>Left Stick / D-Pad</span>
                    <span className="text-white font-semibold">Steering & Movement</span>
                  </div>
                  <div className="flex justify-between">
                    <span>A Button / Cross (×)</span>
                    <span className="text-white font-semibold">Gas / Jump / Action</span>
                  </div>
                  <div className="flex justify-between">
                    <span>B Button / Circle (○)</span>
                    <span className="text-white font-semibold">Brake / Drift</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Right Trigger (RT / R2)</span>
                    <span className="text-white font-semibold">Accelerate / Boost</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Platform Hotkeys */}
            {activeTab === 'shortcuts' && (
              <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {SHORTCUTS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="text-gray-300 text-xs font-medium">{label}</span>
                    <kbd className="px-2.5 py-0.5 bg-white/10 border border-white/20 rounded-md text-white text-xs font-mono font-bold shadow-sm">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Focus Action */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[10px] text-gray-500">Press Esc or ? to toggle guide</span>
              <button
                type="button"
                onClick={handleFocusAndClose}
                className="px-4 py-2 bg-[#6366F1] hover:bg-[#5356e8] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366F1]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Back to Game</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

