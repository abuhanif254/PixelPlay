"use client";

import React, { useState, useRef } from 'react';
import { Play, Maximize2, Sun, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { useRecentGames } from '@/hooks/useRecentGames';

interface GamePlayerProps {
  children: React.ReactNode;
  title: string;
  slug: string;
  image?: string;
}

export default function GamePlayer({ children, title, slug, image }: GamePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addRecentGame } = useRecentGames();

  const handlePlay = () => {
    setIsPlaying(true);
    addRecentGame(slug);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full relative bg-[#111228] rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px]"
    >
      {!isPlaying ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0B1A]/90 z-20">
          {image && (
            <Image 
              src={image} 
              alt={title} 
              fill 
              className="object-cover opacity-20 blur-md" 
            />
          )}
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <button 
              onClick={handlePlay}
              className="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#6366F1] text-white hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(99,102,241,0.4)]"
            >
              <div className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-20"></div>
              <Play size={36} className="ml-2 group-hover:scale-110 transition-transform" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide font-outfit drop-shadow-md">
              Play {title}
            </h2>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative z-10">
            {children}
          </div>
          
          {/* Universal Toolbar (Bottom Right) */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
            <button 
              onClick={toggleFullscreen}
              className="p-3 bg-[#0A0B1A]/80 hover:bg-[#6366F1] text-gray-300 hover:text-white rounded-xl backdrop-blur-sm transition-all border border-white/10 shadow-lg"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
            <button 
              className="p-3 bg-[#0A0B1A]/80 hover:bg-[#6366F1] text-gray-300 hover:text-white rounded-xl backdrop-blur-sm transition-all border border-white/10 shadow-lg"
              title="Theme Toggle"
            >
              <Sun size={18} />
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-[#0A0B1A]/80 hover:bg-[#6366F1] text-gray-300 hover:text-white rounded-xl backdrop-blur-sm transition-all border border-white/10 shadow-lg"
              title="Toggle Sound"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
