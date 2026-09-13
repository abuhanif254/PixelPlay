'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Gamepad2, 
  Eye, 
  EyeOff, 
  Move, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  X,
  Settings2
} from 'lucide-react';

interface TouchGamepadProps {
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  enabled?: boolean;
  onClose?: () => void;
}

const KEY_MAPPINGS: Record<string, { key: string; code: string; keyCode: number }> = {
  up: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
  down: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
  left: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
  right: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
  actionA: { key: ' ', code: 'Space', keyCode: 32 }, // Space / Jump
  actionB: { key: 'Enter', code: 'Enter', keyCode: 13 }, // Enter / Action
  actionX: { key: 'Shift', code: 'ShiftLeft', keyCode: 16 }, // Shift / Sprint
  actionY: { key: 'z', code: 'KeyZ', keyCode: 90 }, // Secondary
};

export default function TouchGamepad({ iframeRef, enabled = true, onClose }: TouchGamepadProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.85);
  const [dpadMode, setDpadMode] = useState<'arrows' | 'wasd'>('arrows');
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});

  // Dispatch key event to window and target iframe
  const dispatchKey = useCallback((dir: string, type: 'keydown' | 'keyup') => {
    let keyInfo = KEY_MAPPINGS[dir];
    if (dpadMode === 'wasd') {
      if (dir === 'up') keyInfo = { key: 'w', code: 'KeyW', keyCode: 87 };
      if (dir === 'down') keyInfo = { key: 's', code: 'KeyS', keyCode: 83 };
      if (dir === 'left') keyInfo = { key: 'a', code: 'KeyA', keyCode: 65 };
      if (dir === 'right') keyInfo = { key: 'd', code: 'KeyD', keyCode: 68 };
    }

    if (!keyInfo) return;

    // Haptic feedback
    if (type === 'keydown' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(12);
      } catch {}
    }

    const eventInit: KeyboardEventInit = {
      key: keyInfo.key,
      code: keyInfo.code,
      bubbles: true,
      cancelable: true,
      composed: true,
      repeat: false
    };

    // 1. Dispatch to current window & document
    try {
      const docEvt = new KeyboardEvent(type, eventInit);
      Object.defineProperty(docEvt, 'keyCode', { get: () => keyInfo.keyCode });
      Object.defineProperty(docEvt, 'which', { get: () => keyInfo.keyCode });
      document.dispatchEvent(docEvt);
      window.dispatchEvent(docEvt);
    } catch {}

    // 2. Dispatch to iframe if accessible
    if (iframeRef?.current) {
      try {
        const iframeWin = iframeRef.current.contentWindow;
        if (iframeWin) {
          const iframeEvt = new KeyboardEvent(type, eventInit);
          Object.defineProperty(iframeEvt, 'keyCode', { get: () => keyInfo.keyCode });
          Object.defineProperty(iframeEvt, 'which', { get: () => keyInfo.keyCode });
          iframeWin.dispatchEvent(iframeEvt);
          iframeWin.document?.dispatchEvent(iframeEvt);

          // Also postMessage for SDK or custom listeners
          iframeWin.postMessage({
            source: 'SPIELCADE_VIRTUAL_PAD',
            eventType: type,
            key: keyInfo.key,
            code: keyInfo.code,
            keyCode: keyInfo.keyCode
          }, '*');
        }
      } catch {
        // Cross-origin iframe fallback: postMessage only
        try {
          iframeRef.current.contentWindow?.postMessage({
            source: 'SPIELCADE_VIRTUAL_PAD',
            eventType: type,
            key: keyInfo.key,
            code: keyInfo.code,
            keyCode: keyInfo.keyCode
          }, '*');
        } catch {}
      }
    }
  }, [iframeRef, dpadMode]);

  const handlePressStart = (dir: string, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setActiveKeys(prev => ({ ...prev, [dir]: true }));
    dispatchKey(dir, 'keydown');
  };

  const handlePressEnd = (dir: string, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setActiveKeys(prev => ({ ...prev, [dir]: false }));
    dispatchKey(dir, 'keyup');
  };

  if (!enabled) return null;

  return (
    <div 
      className="fixed inset-x-0 bottom-0 pointer-events-none z-40 select-none pb-safe transition-opacity"
      style={{ opacity: isVisible ? opacity : 0 }}
    >
      <div className="max-w-6xl mx-auto px-4 pb-6 flex items-end justify-between relative">
        
        {/* Left Side: 4-Way D-Pad */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="relative w-36 h-36 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-2xl p-2 flex items-center justify-center">
            
            {/* UP */}
            <button
              onTouchStart={(e) => handlePressStart('up', e)}
              onTouchEnd={(e) => handlePressEnd('up', e)}
              onMouseDown={(e) => handlePressStart('up', e)}
              onMouseUp={(e) => handlePressEnd('up', e)}
              aria-label="Up"
              className={`absolute top-1.5 w-11 h-11 rounded-t-xl bg-white/10 hover:bg-white/20 active:bg-indigo-600/80 border border-white/15 flex items-center justify-center transition-all ${
                activeKeys['up'] ? 'bg-indigo-600 shadow-lg shadow-indigo-600/50 scale-95 text-white' : 'text-white/80'
              }`}
            >
              <ChevronUp size={24} />
            </button>

            {/* DOWN */}
            <button
              onTouchStart={(e) => handlePressStart('down', e)}
              onTouchEnd={(e) => handlePressEnd('down', e)}
              onMouseDown={(e) => handlePressStart('down', e)}
              onMouseUp={(e) => handlePressEnd('down', e)}
              aria-label="Down"
              className={`absolute bottom-1.5 w-11 h-11 rounded-b-xl bg-white/10 hover:bg-white/20 active:bg-indigo-600/80 border border-white/15 flex items-center justify-center transition-all ${
                activeKeys['down'] ? 'bg-indigo-600 shadow-lg shadow-indigo-600/50 scale-95 text-white' : 'text-white/80'
              }`}
            >
              <ChevronDown size={24} />
            </button>

            {/* LEFT */}
            <button
              onTouchStart={(e) => handlePressStart('left', e)}
              onTouchEnd={(e) => handlePressEnd('left', e)}
              onMouseDown={(e) => handlePressStart('left', e)}
              onMouseUp={(e) => handlePressEnd('left', e)}
              aria-label="Left"
              className={`absolute left-1.5 w-11 h-11 rounded-l-xl bg-white/10 hover:bg-white/20 active:bg-indigo-600/80 border border-white/15 flex items-center justify-center transition-all ${
                activeKeys['left'] ? 'bg-indigo-600 shadow-lg shadow-indigo-600/50 scale-95 text-white' : 'text-white/80'
              }`}
            >
              <ChevronLeft size={24} />
            </button>

            {/* RIGHT */}
            <button
              onTouchStart={(e) => handlePressStart('right', e)}
              onTouchEnd={(e) => handlePressEnd('right', e)}
              onMouseDown={(e) => handlePressStart('right', e)}
              onMouseUp={(e) => handlePressEnd('right', e)}
              aria-label="Right"
              className={`absolute right-1.5 w-11 h-11 rounded-r-xl bg-white/10 hover:bg-white/20 active:bg-indigo-600/80 border border-white/15 flex items-center justify-center transition-all ${
                activeKeys['right'] ? 'bg-indigo-600 shadow-lg shadow-indigo-600/50 scale-95 text-white' : 'text-white/80'
              }`}
            >
              <ChevronRight size={24} />
            </button>

            {/* Center Anchor */}
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 pointer-events-none flex items-center justify-center">
              <span className="text-[9px] font-bold text-white/40 uppercase">
                {dpadMode === 'arrows' ? 'PAD' : 'WASD'}
              </span>
            </div>

          </div>
        </div>

        {/* Center Toolbar / Mode switch */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 mb-2">
          <button
            onClick={() => setDpadMode(m => m === 'arrows' ? 'wasd' : 'arrows')}
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 border border-indigo-500/30"
          >
            {dpadMode === 'arrows' ? 'Arrow Keys' : 'WASD'}
          </button>
          <button
            onClick={() => setOpacity(op => op === 0.85 ? 0.5 : op === 0.5 ? 0.25 : 0.85)}
            className="text-white/70 hover:text-white text-[10px] font-mono px-1.5 py-0.5"
            title="Toggle Opacity"
          >
            {Math.round(opacity * 100)}%
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-0.5 rounded"
              title="Close Virtual Controller"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right Side: Action Buttons (A, B, X, Y) */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="relative w-36 h-36 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-2xl p-2 flex items-center justify-center">
            
            {/* BUTTON A (Bottom - Space / Primary Jump) */}
            <button
              onTouchStart={(e) => handlePressStart('actionA', e)}
              onTouchEnd={(e) => handlePressEnd('actionA', e)}
              onMouseDown={(e) => handlePressStart('actionA', e)}
              onMouseUp={(e) => handlePressEnd('actionA', e)}
              aria-label="Action A"
              className={`absolute bottom-2 right-4 w-12 h-12 rounded-full font-black text-sm border border-emerald-400/30 shadow-lg flex items-center justify-center transition-all ${
                activeKeys['actionA'] 
                  ? 'bg-emerald-500 text-white scale-90 shadow-emerald-500/50' 
                  : 'bg-emerald-600/80 text-emerald-100 hover:bg-emerald-500'
              }`}
            >
              A
            </button>

            {/* BUTTON B (Right - Action / Attack) */}
            <button
              onTouchStart={(e) => handlePressStart('actionB', e)}
              onTouchEnd={(e) => handlePressEnd('actionB', e)}
              onMouseDown={(e) => handlePressStart('actionB', e)}
              onMouseUp={(e) => handlePressEnd('actionB', e)}
              aria-label="Action B"
              className={`absolute top-4 right-1 w-12 h-12 rounded-full font-black text-sm border border-rose-400/30 shadow-lg flex items-center justify-center transition-all ${
                activeKeys['actionB'] 
                  ? 'bg-rose-500 text-white scale-90 shadow-rose-500/50' 
                  : 'bg-rose-600/80 text-rose-100 hover:bg-rose-500'
              }`}
            >
              B
            </button>

            {/* BUTTON X (Left - Shift / Boost) */}
            <button
              onTouchStart={(e) => handlePressStart('actionX', e)}
              onTouchEnd={(e) => handlePressEnd('actionX', e)}
              onMouseDown={(e) => handlePressStart('actionX', e)}
              onMouseUp={(e) => handlePressEnd('actionX', e)}
              aria-label="Action X"
              className={`absolute bottom-4 left-1 w-11 h-11 rounded-full font-black text-xs border border-blue-400/30 shadow-lg flex items-center justify-center transition-all ${
                activeKeys['actionX'] 
                  ? 'bg-blue-500 text-white scale-90 shadow-blue-500/50' 
                  : 'bg-blue-600/70 text-blue-100 hover:bg-blue-500'
              }`}
            >
              X
            </button>

            {/* BUTTON Y (Top - Secondary) */}
            <button
              onTouchStart={(e) => handlePressStart('actionY', e)}
              onTouchEnd={(e) => handlePressEnd('actionY', e)}
              onMouseDown={(e) => handlePressStart('actionY', e)}
              onMouseUp={(e) => handlePressEnd('actionY', e)}
              aria-label="Action Y"
              className={`absolute top-2 left-4 w-11 h-11 rounded-full font-black text-xs border border-amber-400/30 shadow-lg flex items-center justify-center transition-all ${
                activeKeys['actionY'] 
                  ? 'bg-amber-500 text-white scale-90 shadow-amber-500/50' 
                  : 'bg-amber-600/70 text-amber-100 hover:bg-amber-500'
              }`}
            >
              Y
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
