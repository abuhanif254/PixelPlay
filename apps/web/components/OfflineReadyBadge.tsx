'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface OfflineReadyBadgeProps {
  className?: string;
  short?: boolean;
}

export default function OfflineReadyBadge({ className = '', short = false }: OfflineReadyBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 ${className}`}
      title="This game is cached locally and works without an active internet connection."
    >
      <Zap size={11} className="text-cyan-500 fill-current animate-pulse" />
      <span>{short ? 'Offline' : 'Offline Ready'}</span>
    </span>
  );
}
