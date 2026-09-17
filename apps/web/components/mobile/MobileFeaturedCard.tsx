'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, RotateCw, Video, Sparkles, Flame } from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';
import { isWhitelistedImage } from '@/lib/image-helpers';
import { MobileGameItem, MobileBadgeType } from './types';

interface MobileFeaturedCardProps {
  game: MobileGameItem;
  priority?: boolean;
  badge?: MobileBadgeType;
}

export default function MobileFeaturedCard({
  game,
  priority = false,
  badge = 'video',
}: MobileFeaturedCardProps) {
  const imageUrl = game.image_url || game.image || '';
  const destinationHref = !game.slug || game.slug === '#' ? '/games' : `/games/${game.slug}`;

  return (
    <div className="px-3.5 sm:px-4 my-2">
      <Link
        href={destinationHref}
        onClick={() => arcadeAudio.playBlip()}
        className="block group relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-xl bg-slate-900 active:scale-[0.98] transition-transform select-none"
      >
        {/* Main 16:9 Showcase Cover Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            unoptimized={!isWhitelistedImage(imageUrl)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-white/30 text-2xl bg-gradient-to-br from-[#111228] to-[#1E1B4B]">
            {game.title?.substring(0, 3).toUpperCase()}
          </div>
        )}

        {/* Top-Left Micro Feature Badge */}
        {badge !== 'none' && (
          <div className="absolute top-2.5 left-2.5 z-10">
            {badge === 'refresh' && (
              <div className="w-6 h-6 rounded-lg bg-cyan-500/90 backdrop-blur-md text-white flex items-center justify-center shadow-md">
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            )}
            {badge === 'video' && (
              <div className="w-6 h-6 rounded-lg bg-purple-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-md">
                <Video className="w-3.5 h-3.5 fill-white" />
              </div>
            )}
            {badge === 'star' && (
              <div className="w-6 h-6 rounded-lg bg-amber-500/90 backdrop-blur-md text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
              </div>
            )}
            {badge === 'flame' && (
              <div className="w-6 h-6 rounded-lg bg-rose-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-md">
                <Flame className="w-3.5 h-3.5 fill-white" />
              </div>
            )}
          </div>
        )}

        {/* Bottom Scrim & Control Dock */}
        <div className="absolute inset-x-0 bottom-0 pt-14 pb-3 px-3 sm:px-3.5 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            {/* Mini Game Thumbnail Icon */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-slate-800">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  sizes="48px"
                  unoptimized={!isWhitelistedImage(imageUrl)}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/50">
                  {game.title?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-black text-white truncate max-w-[150px] sm:max-w-[200px] leading-tight">
                {game.title}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                {game.category || 'Arcade'}
              </span>
            </div>
          </div>

          {/* Glowing Purple/Indigo Play Button Pill */}
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/40 group-active:scale-95 transition-all">
              <Play className="w-3 h-3 fill-current" />
              <span>Play</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
