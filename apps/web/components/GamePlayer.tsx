"use client";

import React, { useState, useRef } from 'react';
import { Play, Maximize2, Sun, Volume2, VolumeX, RotateCcw, RotateCw, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { useRecentGames } from '@/hooks/useRecentGames';

interface GamePlayerProps {
  children?: React.ReactNode;
  title: string;
  slug: string;
  image?: string;
  sourceUrl?: string | null;
  onGameOver?: (score: number) => void;
}

export default function GamePlayer({ children, title, slug, image, sourceUrl, onGameOver }: GamePlayerProps) {
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

  // Listen for messages from the Plugin SDK
  React.useEffect(() => {
    if (!isPlaying || !sourceUrl) return;

    const handleMessage = (event: MessageEvent) => {
      // Basic security check: ensure it's from our SDK format
      if (event.data && event.data.source === 'PIXELPLAY_SDK') {
        console.log('[Platform] Received SDK Message:', event.data);
        
        switch (event.data.type) {
          case 'SUBMIT_SCORE':
            if (onGameOver && typeof event.data.payload?.score === 'number') {
              onGameOver(event.data.payload.score);
            }
            break;
          case 'UNLOCK_ACHIEVEMENT':
            // Future feature: handle achievement unlocks
            console.log('Achievement unlocked:', event.data.payload?.key);
            break;
          case 'GAME_OVER':
            // Could show a game over overlay
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPlaying, sourceUrl, onGameOver]);

  return (
    <div 
      ref={containerRef}
      className="w-full relative bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl min-h-[400px] md:min-h-[500px]"
    >
      {!isPlaying ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-[#0A0B1A]/90 z-20 transition-colors">
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-wide font-outfit drop-shadow-md">
              Play {title}
            </h2>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col md:flex-row p-4 md:p-6 gap-6 relative z-10">
          
          {/* Game Canvas Area (Left Side) */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-[#0A0B1A]/50 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden min-h-[400px] relative">
            {sourceUrl ? (
              <iframe 
                src={sourceUrl}
                className="absolute inset-0 w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title={title}
              />
            ) : (
              children
            )}
          </div>
          
          {/* Internal Game Controls Sidebar (Right Side) */}
          <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
            
            {/* Score & Best Box */}
            <div className="flex bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden divide-x divide-gray-200 dark:divide-white/5">
              <div className="flex-1 py-3 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-gray-500 tracking-widest mb-0.5">SCORE</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white font-outfit">2048</span>
              </div>
              <div className="flex-1 py-3 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-gray-500 tracking-widest mb-0.5">BEST</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white font-outfit">4096</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <button className="w-full py-3.5 bg-[#6366F1] hover:bg-[#5457DF] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#6366F1]/20">
              <RotateCw size={16} />
              New Game
            </button>

            <button className="w-full py-3 bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={16} />
              Undo
            </button>

            <button className="w-full py-3 bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mb-auto">
              <HelpCircle size={16} />
              How to Play
            </button>
            
            {/* Universal Toolbar (Bottom Area) */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
              <button 
                onClick={toggleFullscreen}
                className="flex-1 py-3 flex items-center justify-center bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
              <button 
                className="flex-1 py-3 flex items-center justify-center bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                title="Theme Toggle"
              >
                <Sun size={16} />
              </button>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="flex-1 py-3 flex items-center justify-center bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                title="Toggle Sound"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
