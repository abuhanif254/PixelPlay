'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Zap, X, ChevronUp, ChevronDown, Check, Sliders } from 'lucide-react';
import { gamepadEngine, GamepadButtonState, GamepadInfo } from '@/lib/gamepad-engine';

export default function GamepadHUD() {
  const [gamepadInfo, setGamepadInfo] = useState<GamepadInfo | null>(null);
  const [btnState, setBtnState] = useState<GamepadButtonState | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const unsubscribe = gamepadEngine.subscribe((state, info) => {
      setBtnState(state);
      setGamepadInfo((prev) => {
        if (!prev && info) {
          setShowToast(true);
          const timer = setTimeout(() => setShowToast(false), 4000);
          return info;
        }
        return info;
      });
    });

    return () => unsubscribe();
  }, []);

  if (!gamepadInfo) return null;

  const brandLabel = {
    xbox: 'Xbox Controller',
    playstation: 'PlayStation DualSense/DualShock',
    switch: 'Nintendo Switch Controller',
    generic: 'Bluetooth Gamepad',
  }[gamepadInfo.brand];

  return (
    <>
      {/* Auto Connection Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[#111228]/95 backdrop-blur-xl border border-emerald-500/40 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 shadow-emerald-500/20"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-400">Gamepad Connected</p>
              <p className="text-xs font-bold text-slate-200">{brandLabel} Ready</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-2"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Micro-HUD */}
      <div className="fixed bottom-20 left-4 z-[65]">
        <div className="bg-[#111228]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-xs font-bold"
              title="Click to toggle Gamepad Visualizer & Settings"
            >
              <div className="relative">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="text-slate-200 hidden sm:inline">{brandLabel}</span>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            <button
              onClick={() => gamepadEngine.vibrate(0.4, 0.7, 150)}
              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/5 transition-colors"
              title="Test Vibration Rumble"
              aria-label="Test Rumble"
            >
              <Zap size={14} />
            </button>
          </div>

          {/* Expanded Visualizer Tray */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2 border-t border-white/5 mt-2"
              >
                <div className="p-2 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Input Monitor</span>
                    <span className="text-emerald-400 font-mono text-[10px]">60 Hz Polling</span>
                  </div>

                  {/* Real-time button indicator matrix */}
                  <div className="grid grid-cols-2 gap-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    {/* D-Pad / Analog */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-500 mb-1 font-semibold">D-PAD / STICK</span>
                      <div className="grid grid-cols-3 gap-1 w-16 h-16">
                        <div />
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.dpadUp ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>▲</div>
                        <div />
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.dpadLeft ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>◀</div>
                        <div className="rounded bg-white/5 flex items-center justify-center text-[8px] text-slate-600">•</div>
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.dpadRight ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>▶</div>
                        <div />
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.dpadDown ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>▼</div>
                        <div />
                      </div>
                    </div>

                    {/* Face Buttons */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-500 mb-1 font-semibold">ACTION KEYS</span>
                      <div className="grid grid-cols-3 gap-1 w-16 h-16">
                        <div />
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.y ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'}`}>Y</div>
                        <div />
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.x ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>X</div>
                        <div className="rounded bg-white/5 flex items-center justify-center text-[8px] text-slate-600">•</div>
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.b ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-500'}`}>B</div>
                        <div />
                        <div className={`rounded flex items-center justify-center text-[9px] font-bold ${btnState?.a ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>A</div>
                        <div />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-white/5 px-2 py-1.5 rounded-lg">
                    <span>Mapped to:</span>
                    <span className="font-mono text-indigo-400 font-bold">WASD + Arrows + Space</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
