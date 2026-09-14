'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  LayoutGrid,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  Gamepad2,
  X,
} from 'lucide-react';
import { gamepadEngine } from '@/lib/gamepad-engine';

interface VirtualControlsOverlayProps {
  onClose?: () => void;
}

type StickMode = 'dpad' | 'analog';
type OpacityLevel = 'low' | 'medium' | 'full';

const KEY_MAPPINGS: Record<string, { key: string; code: string }> = {
  up: { key: 'ArrowUp', code: 'ArrowUp' },
  down: { key: 'ArrowDown', code: 'ArrowDown' },
  left: { key: 'ArrowLeft', code: 'ArrowLeft' },
  right: { key: 'ArrowRight', code: 'ArrowRight' },
  a: { key: ' ', code: 'Space' },
  b: { key: 'Shift', code: 'ShiftLeft' },
  x: { key: 'e', code: 'KeyE' },
  y: { key: 'q', code: 'KeyQ' },
};

const OPACITY_CLASSES: Record<OpacityLevel, string> = {
  low: 'opacity-35 hover:opacity-80 transition-opacity',
  medium: 'opacity-70 hover:opacity-95 transition-opacity',
  full: 'opacity-100',
};

export default function VirtualControlsOverlay({ onClose }: VirtualControlsOverlayProps) {
  const [stickMode, setStickMode] = useState<StickMode>('dpad');
  const [opacity, setOpacity] = useState<OpacityLevel>('medium');
  const [isMinimized, setIsMinimized] = useState(false);

  // Active pressed buttons state for visual feedback
  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});

  // Analog stick tracking refs
  const stickBaseRef = useRef<HTMLDivElement>(null);
  const stickTouchIdRef = useRef<number | null>(null);
  const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });
  const activeDirectionsRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Haptic feedback
  const triggerHaptic = useCallback((ms = 12) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch {}
  }, []);

  // Button Press Handler (Touchstart / Mousedown)
  const handlePressStart = useCallback((btnKey: string) => {
    triggerHaptic(12);
    setActiveButtons((prev) => ({ ...prev, [btnKey]: true }));

    const mapping = KEY_MAPPINGS[btnKey];
    if (mapping) {
      gamepadEngine.simulateKey('keydown', mapping.key, mapping.code);
    }
  }, [triggerHaptic]);

  // Button Release Handler (Touchend / Mouseup)
  const handlePressEnd = useCallback((btnKey: string) => {
    setActiveButtons((prev) => ({ ...prev, [btnKey]: false }));

    const mapping = KEY_MAPPINGS[btnKey];
    if (mapping) {
      gamepadEngine.simulateKey('keyup', mapping.key, mapping.code);
    }
  }, []);

  // Analog Stick Logic
  const updateAnalogDirections = useCallback((dx: number, dy: number) => {
    const threshold = 18;
    const isUp = dy < -threshold;
    const isDown = dy > threshold;
    const isLeft = dx < -threshold;
    const isRight = dx > threshold;

    const prev = activeDirectionsRef.current;

    // Up
    if (isUp !== prev.up) {
      gamepadEngine.simulateKey(isUp ? 'keydown' : 'keyup', KEY_MAPPINGS.up.key, KEY_MAPPINGS.up.code);
      prev.up = isUp;
    }
    // Down
    if (isDown !== prev.down) {
      gamepadEngine.simulateKey(isDown ? 'keydown' : 'keyup', KEY_MAPPINGS.down.key, KEY_MAPPINGS.down.code);
      prev.down = isDown;
    }
    // Left
    if (isLeft !== prev.left) {
      gamepadEngine.simulateKey(isLeft ? 'keydown' : 'keyup', KEY_MAPPINGS.left.key, KEY_MAPPINGS.left.code);
      prev.left = isLeft;
    }
    // Right
    if (isRight !== prev.right) {
      gamepadEngine.simulateKey(isRight ? 'keydown' : 'keyup', KEY_MAPPINGS.right.key, KEY_MAPPINGS.right.code);
      prev.right = isRight;
    }

    setActiveButtons((b) => ({
      ...b,
      up: isUp,
      down: isDown,
      left: isLeft,
      right: isRight,
    }));
  }, []);

  const handleStickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (stickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch || !stickBaseRef.current) return;

    stickTouchIdRef.current = touch.identifier;
    triggerHaptic(15);

    const rect = stickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    const maxRadius = rect.width / 2 - 10;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setStickPosition({ x: dx, y: dy });
    updateAnalogDirections(dx, dy);
  };

  const handleStickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (stickTouchIdRef.current === null || !stickBaseRef.current) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === stickTouchIdRef.current) {
        const rect = stickBaseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;

        const maxRadius = rect.width / 2 - 8;
        const dist = Math.hypot(dx, dy);

        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }

        setStickPosition({ x: dx, y: dy });
        updateAnalogDirections(dx, dy);
        break;
      }
    }
  };

  const handleStickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (stickTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === stickTouchIdRef.current) {
        stickTouchIdRef.current = null;
        setStickPosition({ x: 0, y: 0 });
        updateAnalogDirections(0, 0);
        break;
      }
    }
  };

  // Clean up keys on unmount
  useEffect(() => {
    return () => {
      Object.values(KEY_MAPPINGS).forEach((mapping) => {
        gamepadEngine.simulateKey('keyup', mapping.key, mapping.code);
      });
    };
  }, []);

  const cycleOpacity = () => {
    setOpacity((curr) => (curr === 'low' ? 'medium' : curr === 'medium' ? 'full' : 'low'));
  };

  if (isMinimized) {
    return (
      <div className="absolute bottom-4 left-4 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-3 rounded-full bg-black/75 backdrop-blur-xl border border-indigo-500/40 text-indigo-400 shadow-2xl flex items-center gap-2 text-xs font-black animate-pulse"
        >
          <Gamepad2 size={18} />
          <span>Show Gamepad</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 z-40 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 transition-opacity duration-200 ${OPACITY_CLASSES[opacity]}`}
    >
      {/* Top Floating Mini-Bar (Centered controls) */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setStickMode((m) => (m === 'dpad' ? 'analog' : 'dpad'))}
            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            title={`Switch to ${stickMode === 'dpad' ? 'Analog Stick' : 'D-Pad'}`}
          >
            {stickMode === 'dpad' ? <Compass size={12} className="text-indigo-400" /> : <LayoutGrid size={12} className="text-pink-400" />}
            <span>{stickMode === 'dpad' ? 'D-Pad' : 'Stick'}</span>
          </button>

          <button
            type="button"
            onClick={cycleOpacity}
            className="px-2 py-1 rounded-full text-[10px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            title="Toggle Opacity"
          >
            <Eye size={12} />
            <span className="capitalize">{opacity}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-full text-gray-400 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minimize2 size={12} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-rose-400 transition-colors"
              title="Close Virtual Controls"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Touch Controls: Left D-Pad/Stick & Right Diamond Buttons */}
      <div className="w-full flex items-end justify-between pb-2 sm:pb-4 pointer-events-auto">
        {/* Left Control Cluster */}
        <div className="relative">
          {stickMode === 'dpad' ? (
            /* Tactile Cross D-Pad */
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              {/* Center Pivot */}
              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 shadow-inner pointer-events-none" />

              {/* Up */}
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); handlePressStart('up'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('up'); }}
                onMouseDown={() => handlePressStart('up')}
                onMouseUp={() => handlePressEnd('up')}
                className={`absolute top-0 w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                  activeButtons.up
                    ? 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                    : 'bg-black/60 border-white/15 text-gray-200 backdrop-blur-md shadow-xl'
                }`}
                aria-label="Up"
              >
                <ChevronUp size={24} />
              </button>

              {/* Down */}
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); handlePressStart('down'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('down'); }}
                onMouseDown={() => handlePressStart('down')}
                onMouseUp={() => handlePressEnd('down')}
                className={`absolute bottom-0 w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                  activeButtons.down
                    ? 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                    : 'bg-black/60 border-white/15 text-gray-200 backdrop-blur-md shadow-xl'
                }`}
                aria-label="Down"
              >
                <ChevronDown size={24} />
              </button>

              {/* Left */}
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); handlePressStart('left'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('left'); }}
                onMouseDown={() => handlePressStart('left')}
                onMouseUp={() => handlePressEnd('left')}
                className={`absolute left-0 w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                  activeButtons.left
                    ? 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                    : 'bg-black/60 border-white/15 text-gray-200 backdrop-blur-md shadow-xl'
                }`}
                aria-label="Left"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Right */}
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); handlePressStart('right'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('right'); }}
                onMouseDown={() => handlePressStart('right')}
                onMouseUp={() => handlePressEnd('right')}
                className={`absolute right-0 w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                  activeButtons.right
                    ? 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                    : 'bg-black/60 border-white/15 text-gray-200 backdrop-blur-md shadow-xl'
                }`}
                aria-label="Right"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          ) : (
            /* Smooth 360° Analog Thumbstick */
            <div
              ref={stickBaseRef}
              onTouchStart={handleStickTouchStart}
              onTouchMove={handleStickTouchMove}
              onTouchEnd={handleStickTouchEnd}
              onTouchCancel={handleStickTouchEnd}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-black/50 border border-white/15 backdrop-blur-xl flex items-center justify-center shadow-2xl touch-none"
            >
              {/* Outer guide ring */}
              <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />

              {/* Thumbstick Knob */}
              <div
                style={{
                  transform: `translate3d(${stickPosition.x}px, ${stickPosition.y}px, 0)`,
                  transition: stickTouchIdRef.current === null ? 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white/40 shadow-[0_0_25px_rgba(99,102,241,0.6)] flex items-center justify-center text-white pointer-events-none"
              >
                <Compass size={24} className="animate-spin-slow opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* Right Action Diamond Buttons (A, B, X, Y) */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Button Y (Top - Special / Q) */}
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handlePressStart('y'); }}
            onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('y'); }}
            onMouseDown={() => handlePressStart('y')}
            onMouseUp={() => handlePressEnd('y')}
            className={`absolute top-0 w-12 sm:w-14 h-12 sm:h-14 rounded-full flex flex-col items-center justify-center border font-black transition-all active:scale-90 ${
              activeButtons.y
                ? 'bg-amber-500 border-amber-300 text-black shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                : 'bg-black/60 border-amber-500/40 text-amber-400 backdrop-blur-md shadow-xl'
            }`}
          >
            <span className="text-base font-outfit">Y</span>
            <span className="text-[8px] opacity-70 -mt-1">Q</span>
          </button>

          {/* Button X (Left - Interact / E) */}
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handlePressStart('x'); }}
            onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('x'); }}
            onMouseDown={() => handlePressStart('x')}
            onMouseUp={() => handlePressEnd('x')}
            className={`absolute left-0 w-12 sm:w-14 h-12 sm:h-14 rounded-full flex flex-col items-center justify-center border font-black transition-all active:scale-90 ${
              activeButtons.x
                ? 'bg-blue-500 border-blue-300 text-white shadow-[0_0_25px_rgba(59,130,246,0.8)]'
                : 'bg-black/60 border-blue-500/40 text-blue-400 backdrop-blur-md shadow-xl'
            }`}
          >
            <span className="text-base font-outfit">X</span>
            <span className="text-[8px] opacity-70 -mt-1">E</span>
          </button>

          {/* Button B (Right - Run / Dash / Shift) */}
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handlePressStart('b'); }}
            onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('b'); }}
            onMouseDown={() => handlePressStart('b')}
            onMouseUp={() => handlePressEnd('b')}
            className={`absolute right-0 w-12 sm:w-14 h-12 sm:h-14 rounded-full flex flex-col items-center justify-center border font-black transition-all active:scale-90 ${
              activeButtons.b
                ? 'bg-rose-500 border-rose-300 text-white shadow-[0_0_25px_rgba(244,63,94,0.8)]'
                : 'bg-black/60 border-rose-500/40 text-rose-400 backdrop-blur-md shadow-xl'
            }`}
          >
            <span className="text-base font-outfit">B</span>
            <span className="text-[8px] opacity-70 -mt-1">Shift</span>
          </button>

          {/* Button A (Bottom - Jump / Primary / Space) */}
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handlePressStart('a'); }}
            onTouchEnd={(e) => { e.preventDefault(); handlePressEnd('a'); }}
            onMouseDown={() => handlePressStart('a')}
            onMouseUp={() => handlePressEnd('a')}
            className={`absolute bottom-0 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex flex-col items-center justify-center border-2 font-black transition-all active:scale-90 ${
              activeButtons.a
                ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_30px_rgba(16,185,129,0.8)]'
                : 'bg-black/70 border-emerald-500/60 text-emerald-400 backdrop-blur-md shadow-2xl'
            }`}
          >
            <span className="text-lg font-outfit">A</span>
            <span className="text-[9px] opacity-80 -mt-1 font-mono">SPACE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
