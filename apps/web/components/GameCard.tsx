'use client';

import React from 'react';
import { Play, Star, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface GameCardProps {
  title: string;
  imageUrl?: string;
  rating?: number;
  category?: string;
  slug?: string;
  plays?: string;
  isNew?: boolean;
  rank?: number;
}

export default function GameCard({ 
  title, 
  imageUrl, 
  rating = 4.5, 
  category = 'Action', 
  slug = '#',
  plays = '50K plays',
  isNew = false,
  rank
}: GameCardProps) {
  // Determine badge styling based on rank
  let rankBadge = null;
  if (rank === 1) {
    rankBadge = 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-600 text-slate-950 shadow-[0_0_18px_rgba(250,204,21,0.6)]';
  } else if (rank === 2) {
    rankBadge = 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-950 shadow-[0_0_12px_rgba(203,213,225,0.5)]';
  } else if (rank === 3) {
    rankBadge = 'bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-800 text-white shadow-[0_0_10px_rgba(217,119,6,0.4)]';
  } else if (rank !== undefined) {
    rankBadge = 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md';
  }

  const destinationHref = slug.startsWith('/') 
    ? slug 
    : (slug.startsWith('#') ? slug : `/games/${slug}`);

  return (
    <Link 
      href={destinationHref} 
      title={`Play ${title} - Free Online Browser Game`} 
      className="block group h-full select-none"
    >
      <motion.div 
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative flex flex-col bg-white dark:bg-[#111228]/95 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 h-full shadow-sm hover:border-[#6366F1]/60 hover:shadow-[0_12px_35px_rgba(99,102,241,0.25)] transition-all duration-300 overflow-hidden"
      >
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-2.5 bg-gray-100 dark:bg-[#070818] border border-black/5 dark:border-white/5">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={title} 
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 font-extrabold uppercase tracking-widest text-xs bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#111228] dark:to-[#1D1B4B]">
              {title.substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* NEW Badge overlay */}
          {isNew && !rank && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-bold tracking-wider rounded-md uppercase shadow-md shadow-pink-500/30">
                NEW
              </span>
            </div>
          )}

          {/* Rank Badge overlay */}
          {rank !== undefined && (
            <div className={`absolute top-0 left-0 z-10 w-8 h-8 rounded-br-xl rounded-tl-xl ${rankBadge} flex items-center justify-center font-extrabold text-xs font-mono`}>
              {rank <= 3 ? (
                <span className="flex items-center gap-0.5">#{rank}</span>
              ) : (
                `#${rank}`
              )}
            </div>
          )}

          {/* Category Pill overlay */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md border border-white/10 text-white text-[9px] sm:text-[10px] font-bold tracking-wider rounded-md uppercase">
              {category}
            </span>
          </div>

          {/* Glowing Play Button */}
          <div className="absolute bottom-2 right-2 z-10">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 shadow-lg shadow-[#6366F1]/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.8)]">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex flex-col px-1 pb-1 mt-auto relative z-10">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-[#6366F1] transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              {plays}
            </span>
            <div className="flex items-center text-yellow-500 gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        
      </motion.div>
    </Link>
  );
}
