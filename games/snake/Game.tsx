"use client";

import React, { useEffect, useRef, useState } from 'react';
import { StartGame } from './engine/PhaserGame';
import { EventBus } from './engine/EventBus';
import Phaser from 'phaser';

interface GameProps {
  onGameOver?: (score: number) => void;
}

export default function SnakeGame({ onGameOver }: GameProps = {}) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Start Phaser
    if (!gameRef.current) {
      gameRef.current = StartGame('phaser-snake-container');
    }

    // Listen to events from Phaser
    EventBus.on('score-update', (newScore: number) => {
      setScore(newScore);
    });

    EventBus.on('game-over', (finalScore: number) => {
      setGameOver(true);
      if (onGameOver) onGameOver(finalScore);
    });

    return () => {
      // Cleanup Phaser on unmount
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      EventBus.removeListener('score-update');
      EventBus.removeListener('game-over');
    };
  }, [onGameOver]);

  const restart = () => {
    setGameOver(false);
    setScore(0);
    // Restart the main scene
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene');
      if (scene) {
        scene.scene.restart();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gray-900 rounded-2xl border border-gray-800 relative">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-white">
        <h2 className="text-xl font-bold">Neon Snake</h2>
        <span className="text-xl font-mono text-accent">Score: {score}</span>
      </div>
      
      <div className="relative">
        <div 
          id="phaser-snake-container" 
          className="rounded-xl shadow-2xl shadow-accent/20 border border-gray-700 bg-black overflow-hidden" 
          style={{ width: 400, height: 400 }} 
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-50">
            <h3 className="text-3xl font-bold text-danger mb-2">Game Over</h3>
            <p className="text-white mb-6">Final Score: {score}</p>
            <button 
              onClick={restart}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-full font-bold transition-colors shadow-lg shadow-primary/30"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-gray-400 text-sm flex gap-6">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700 font-mono">+`+"+?+'</kbd>
          <span>Move</span>
        </div>
      </div>
    </div>
  );
}
