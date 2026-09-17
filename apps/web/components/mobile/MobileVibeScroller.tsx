'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Flame, Users, Gamepad2, Crosshair, Zap } from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';
import { VIBE_ITEMS, VibeItemConfig } from './types';

function renderVibeIcon(iconName: VibeItemConfig['iconName']) {
  switch (iconName) {
    case 'brain':
      return (
        <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-inner">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
      );
    case 'adrenaline':
      return (
        <div className="w-11 h-11 rounded-2xl bg-pink-500/10 border border-pink-400/30 flex items-center justify-center text-pink-400 shadow-inner">
          <Flame className="w-6 h-6 animate-bounce" />
        </div>
      );
    case 'friends':
      return (
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
          <Users className="w-6 h-6" />
        </div>
      );
    case 'arcade':
      return (
        <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 shadow-inner">
          <Gamepad2 className="w-6 h-6" />
        </div>
      );
    case 'shooter':
      return (
        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-center text-rose-400 shadow-inner">
          <Crosshair className="w-6 h-6" />
        </div>
      );
    case 'quick':
    default:
      return (
        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
          <Zap className="w-6 h-6" />
        </div>
      );
  }
}

export default function MobileVibeScroller() {
  return (
    <div className="w-full pt-2 pb-3.5">
      <div 
        className="flex items-center gap-2.5 overflow-x-auto snap-x snap-mandatory px-3.5 sm:px-4 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {VIBE_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => arcadeAudio.playBlip()}
            className={`snap-start flex-shrink-0 w-36 h-28 rounded-2xl p-3.5 bg-gradient-to-br ${item.bgGradient} border ${item.borderClass} shadow-lg shadow-black/20 flex flex-col justify-between active:scale-95 transition-transform select-none relative overflow-hidden group`}
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none -mr-6 -mt-6 group-hover:bg-white/10 transition-colors" />

            <div className="flex items-center justify-between z-10">
              {renderVibeIcon(item.iconName)}
            </div>

            <div className="z-10 mt-auto">
              <span className={`text-xs font-black tracking-tight leading-tight block ${item.textColor}`}>
                {item.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
