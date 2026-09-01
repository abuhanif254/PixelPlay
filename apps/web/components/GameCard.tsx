'use client';

import React from 'react';
import { Play, Star } from 'lucide-react';
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
  plays = '500K',
  isNew = false,
  rank
}: GameCardProps) {
  // Determine badge styling based on rank
  let rankGradient = 'from-purple-500 to-purple-700'; // Default for 4+
  if (rank === 1) rankGradient = 'from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
  else if (rank === 2) rankGradient = 'from-gray-300 to-gray-500 shadow-[0_0_10px_rgba(156,163,175,0.4)]';
  else if (rank === 3) rankGradient = 'from-amber-600 to-amber-800 shadow-[0_0_10px_rgba(217,119,6,0.4)]';

  return (
    <Link href={slug.startsWith('#') ? slug : `/games/${slug}`} title={`Play ${title} - Free Online Game`} className="block group h-full select-none">
      <motion.div 
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative flex flex-col bg-white dark:bg-[#111228]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-3 h-full shadow-sm hover:border-[#6366F1]/60 hover:shadow-[0_12px_35px_rgba(99,102,241,0.2)] transition-all duration-300 overflow-hidden"
      >
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

        {/* Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-[#0A0B1A] border border-black/5 dark:border-white/5">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-108" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest text-xs bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#111228] dark:to-[#1D1B4B]">
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
            <div className={`absolute top-0 left-0 z-10 w-8 h-8 rounded-br-xl rounded-tl-xl bg-gradient-to-br ${rankGradient} flex items-center justify-center shadow-md`}>
              <span className="text-white text-xs font-bold font-mono">
                {rank}
              </span>
            </div>
          )}

          {/* Category Pill overlay */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wider rounded-md uppercase">
              {category}
            </span>
          </div>

          {/* Glowing Play Button */}
          <div className="absolute bottom-2 right-2 z-10">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 shadow-lg shadow-[#6366F1]/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.8)]">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex flex-col px-1 pb-1 mt-auto relative z-10">
          <h3 className="text-[14px] md:text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-[#6366F1] transition-colors">{title}</h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{plays}</span>
            <div className="flex items-center text-[#F59E0B] gap-1 bg-yellow-500/10 dark:bg-yellow-500/10 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
      </motion.div>
    </Link>
  );
}
