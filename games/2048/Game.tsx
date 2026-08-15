'use client';

import React, { useEffect } from 'react';
import { use2048 } from './use2048';
import { Trophy, RotateCcw } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

interface GameProps {
  onGameOver?: (score: number) => void;
}

export default function Game2048({ onGameOver }: GameProps = {}) {
  const { grid, score, bestScore, gameOver, gameWon, move, resetGame, setGameWon } = use2048();

  useEffect(() => {
    if (gameOver && onGameOver) {
      onGameOver(score);
    }
  }, [gameOver, score, onGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => move('UP'),
    onSwipedDown: () => move('DOWN'),
    onSwipedLeft: () => move('LEFT'),
    onSwipedRight: () => move('RIGHT'),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-[#EEE4DA] text-[#776E65]';
      case 4: return 'bg-[#EDE0C8] text-[#776E65]';
      case 8: return 'bg-[#F2B179] text-white';
      case 16: return 'bg-[#F59563] text-white';
      case 32: return 'bg-[#F67C5F] text-white';
      case 64: return 'bg-[#F65E3B] text-white';
      case 128: return 'bg-[#EDCF72] text-white shadow-[0_0_15px_rgba(237,207,114,0.5)]';
      case 256: return 'bg-[#EDCC61] text-white shadow-[0_0_20px_rgba(237,204,97,0.5)]';
      case 512: return 'bg-[#EDC850] text-white shadow-[0_0_25px_rgba(237,200,80,0.6)]';
      case 1024: return 'bg-[#EDC53F] text-white shadow-[0_0_30px_rgba(237,197,63,0.7)] text-4xl';
      case 2048: return 'bg-[#EDC22E] text-white shadow-[0_0_40px_rgba(237,194,46,0.8)] text-4xl';
      default: return 'bg-[#3C3A32] text-[#F9F6F2] text-3xl';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 select-none font-outfit touch-none" {...swipeHandlers}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-5xl font-black text-gray-800 dark:text-white">2048</h1>
        
        <div className="flex gap-2">
          <div className="bg-gray-200 dark:bg-white/10 rounded-lg px-4 py-2 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Score</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{score}</span>
          </div>
          <div className="bg-gray-200 dark:bg-white/10 rounded-lg px-4 py-2 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Best</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{bestScore}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Join the numbers and get to the <strong className="text-gray-900 dark:text-white">2048 tile!</strong>
        </p>
        <button 
          onClick={resetGame}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <RotateCcw size={18} />
          New Game
        </button>
      </div>

      {/* Game Board Container */}
      <div className="relative aspect-square w-full max-w-[500px] bg-[#BBAE9E] dark:bg-[#2A2B3D] rounded-xl p-3 sm:p-4">
        
        {/* The Grid */}
        <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-3 sm:gap-4 relative">
          
          {/* Empty Cells (Background) */}
          {Array(16).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[#CDC1B4] dark:bg-[#111228]/50 rounded-lg w-full h-full"></div>
          ))}

          {/* Active Tiles */}
          {grid.map((row, r) => (
            row.map((val, c) => {
              if (val === 0) return null;
              
              // Positioning logic based on row and column index (0-3)
              // Each cell is 25% width/height minus margins, but absolute positioning is tricky with gaps.
              // We'll use CSS grid for structure, and render active tiles directly in their grid cells.
              // To enable animation, we would need a more complex coordinate tracking system. 
              // For a v1 robust implementation, standard grid placement is solid.
              
              return (
                <div 
                  key={`${r}-${c}-${val}`} 
                  className={`absolute flex items-center justify-center font-bold text-3xl sm:text-4xl rounded-lg transition-all duration-150 ease-in-out ${getTileColor(val)}`}
                  style={{
                    width: 'calc(25% - (3 * 16px / 4))', // rough calculation accounting for gaps
                    height: 'calc(25% - (3 * 16px / 4))',
                    top: `calc(${r * 25}% + ${r * 4}px)`,
                    left: `calc(${c * 25}% + ${c * 4}px)`,
                    transform: 'scale(1)',
                    animation: 'pop 0.2s ease-in-out'
                  }}
                >
                  {val}
                </div>
              );
            })
          ))}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#EEE4DA]/70 dark:bg-[#111228]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
            <h2 className="text-5xl font-black text-gray-800 dark:text-white mb-4 drop-shadow-lg">Game Over!</h2>
            <button 
              onClick={resetGame}
              className="bg-gray-800 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-8 rounded-full text-lg hover:scale-105 transition-all shadow-xl"
            >
              Try Again
            </button>
          </div>
        )}

        {gameWon && (
          <div className="absolute inset-0 bg-[#EDC22E]/40 dark:bg-[#EDC22E]/30 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
            <Trophy size={64} className="text-yellow-400 drop-shadow-xl mb-4" />
            <h2 className="text-5xl font-black text-white mb-6 drop-shadow-lg text-center leading-tight">
              You Win!
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setGameWon(false)}
                className="bg-gray-800 text-white font-bold py-3 px-6 rounded-full hover:scale-105 transition-all shadow-xl"
              >
                Keep Playing
              </button>
              <button 
                onClick={resetGame}
                className="bg-white text-gray-900 font-bold py-3 px-6 rounded-full hover:scale-105 transition-all shadow-xl"
              >
                New Game
              </button>
            </div>
          </div>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
}
