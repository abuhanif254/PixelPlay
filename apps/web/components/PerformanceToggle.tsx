'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Gauge } from 'lucide-react';
import { performanceEngine } from '@/lib/performance-mode';
import { arcadeAudio } from '@/lib/arcade-audio';

interface PerformanceToggleProps {
  showFps?: boolean;
}

export default function PerformanceToggle({ showFps = true }: PerformanceToggleProps) {
  const [isTurbo, setIsTurbo] = useState(false);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const unsubscribe = performanceEngine.subscribe((currentFps, turbo) => {
      setFps(currentFps);
      setIsTurbo(turbo);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = () => {
    arcadeAudio.playBlip();
    performanceEngine.toggleTurbo();
  };

  const fpsColor = fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="flex items-center gap-1.5">
      {showFps && (
        <div 
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] font-bold select-none cursor-default"
          title={`Active Frame Rate: ${fps} FPS`}
        >
          <Gauge size={12} className={fpsColor} />
          <span className={fpsColor}>{fps} FPS</span>
        </div>
      )}

      <button
        onClick={handleToggle}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
          isTurbo
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10 scale-105'
            : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:bg-white/10'
        }`}
        title="Toggle Low-Spec Turbo Mode (reduces GPU load for budget devices)"
        aria-label="Toggle Turbo Performance Mode"
      >
        <Zap size={11} className={isTurbo ? 'fill-amber-400' : ''} />
        <span>Turbo {isTurbo ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  );
}
