'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RotateCw, Video, Sparkles, Flame } from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';
import { isWhitelistedImage } from '@/lib/image-helpers';
import { MobileGameItem, MobileBadgeType } from './types';

interface MobileAppIconCardProps {
  game: MobileGameItem;
  badge?: MobileBadgeType;
  priority?: boolean;
}

export default function MobileAppIconCard({
  game,
  badge = 'none',
  priority = false,
}: MobileAppIconCardProps) {
  const imageUrl = game.image_url || game.image || '';
  const destinationHref = !game.slug || game.slug === '#' ? '/games' : `/games/${game.slug}`;

  return (
    <Link
      href={destinationHref}
      onClick={() => arcadeAudio.playBlip()}
      className="group flex flex-col active:scale-95 transition-transform duration-150 select-none"
    >
      {/* 1:1 Squircle Icon Container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#111228] border border-black/5 dark:border-white/10 shadow-sm group-hover:shadow-md transition-shadow">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 33vw, 120px"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            unoptimized={!isWhitelistedImage(imageUrl)}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400 dark:text-slate-600 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#111228] dark:to-[#1E1B4B]">
            {game.title?.substring(0, 2).toUpperCase()}
          </div>
        )}

        {/* Top-Left Micro Badge */}
        {badge !== 'none' && (
          <div className="absolute top-1.5 left-1.5 z-10">
            {badge === 'refresh' && (
              <div className="w-5 h-5 rounded-md bg-cyan-500/95 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                <RotateCw className="w-3 h-3" />
              </div>
            )}
            {badge === 'video' && (
              <div className="w-5 h-5 rounded-md bg-purple-600/95 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                <Video className="w-3 h-3 fill-white" />
              </div>
            )}
            {badge === 'star' && (
              <div className="w-5 h-5 rounded-md bg-amber-500/95 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-3 h-3 fill-white" />
              </div>
            )}
            {badge === 'flame' && (
              <div className="w-5 h-5 rounded-md bg-rose-600/95 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                <Flame className="w-3 h-3 fill-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clean Single-Line Truncated Title Underneath */}
      <span className="mt-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate text-center block px-0.5 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {game.title}
      </span>
    </Link>
  );
}
