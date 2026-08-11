"use client";

import React, { useState } from 'react';
import { Play, Maximize2, RotateCcw, Pause, Volume2, Share2, Heart } from 'lucide-react';
import Image from 'next/image';

interface GamePlayerProps {
  children: React.ReactNode;
  title: string;
  image?: string;
}

export default function GamePlayer({ children, title, image }: GamePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Game Container */}
      <div className="w-full aspect-video md:aspect-[21/9] lg:aspect-[24/9] bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-2xl flex items-center justify-center">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-20">
            {/* Optional blurred background image if provided */}
            {image && (
              <Image 
                src={image} 
                alt={title} 
                fill 
                className="object-cover opacity-30 blur-sm" 
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center gap-6">
              <button 
                onClick={() => setIsPlaying(true)}
                className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-primary text-white hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/30"
              >
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                <Play size={40} className="ml-2 group-hover:scale-110 transition-transform" />
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                Play {title}
              </h2>
            </div>
          </div>
        ) : (
          <>
            {children}
            
            {/* Inner Fullscreen Button Overlay (Optional for full immersion) */}
            <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors z-10">
              <Maximize2 size={20} />
            </button>
          </>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
        
        {/* Game Controls */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200/50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium">
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Restart</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200/50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium">
            <Pause size={18} />
            <span className="hidden sm:inline">Pause</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200/50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium">
            <Volume2 size={18} />
            <span className="hidden sm:inline">Sound</span>
          </button>
        </div>

        {/* Social / Meta Controls */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200/50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium">
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium">
            <Heart size={18} />
            <span className="hidden sm:inline">Favorite</span>
          </button>
          <button className="flex items-center justify-center p-2 rounded-lg bg-gray-200/50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 sm:hidden">
             <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
