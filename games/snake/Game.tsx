"use client";

import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const TILE_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Wall Collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self Collision
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food Collision
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 100); // 100ms per frame
    return () => clearInterval(intervalId);
  }, [direction, food, gameOver]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.fillStyle = '#0F172A'; // Match app background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines (optional, for aesthetics)
    ctx.strokeStyle = '#1E293B';
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE_SIZE, 0);
      ctx.lineTo(i * TILE_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * TILE_SIZE);
      ctx.lineTo(canvas.width, i * TILE_SIZE);
      ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#EF4444'; // Danger color
    ctx.beginPath();
    ctx.arc(
      food.x * TILE_SIZE + TILE_SIZE / 2,
      food.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#22C55E' : '#4ADE80'; // Accent color for head, lighter for body
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#22C55E';
      ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
      ctx.shadowBlur = 0; // Reset shadow for next draws
    });

  }, [snake, food]);

  const restart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gray-900 rounded-2xl border border-gray-800">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-white">
        <h2 className="text-xl font-bold">Neon Snake</h2>
        <span className="text-xl font-mono text-accent">Score: {score}</span>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * TILE_SIZE}
          height={GRID_SIZE * TILE_SIZE}
          className="rounded-xl shadow-2xl shadow-accent/20 border border-gray-700 bg-black"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
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
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700 font-mono">↑↓←→</kbd>
          <span>Move</span>
        </div>
      </div>
    </div>
  );
}
