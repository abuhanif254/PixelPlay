'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';

interface MobileSectionHeaderProps {
  title: string;
  flag?: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionText?: string;
}

export default function MobileSectionHeader({
  title,
  flag,
  icon,
  actionHref,
  actionText = 'See all',
}: MobileSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3.5 sm:px-4 pt-4 pb-2">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <div className="shrink-0 flex items-center">{icon}</div>}
        <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate flex items-center gap-1.5">
          <span>{title}</span>
          {flag && <span className="inline-block text-base">{flag}</span>}
        </h2>
      </div>

      {actionHref && (
        <Link
          href={actionHref}
          onClick={() => arcadeAudio.playBlip()}
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-0.5 shrink-0 active:scale-95 transition-transform"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
