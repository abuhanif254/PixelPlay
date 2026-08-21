"use client";

import React, { useEffect, useRef, useState } from 'react';

interface GameProps {
  onGameOver?: (score: number) => void;
}

export default function NeonFlyerGame({ onGameOver }: GameProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);

  // Audio System
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'jump' | 'score' | 'crash') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    
    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'score') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'crash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };

  // Main Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed Dimensions for consistent gameplay
    const width = 400;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    // Game Variables
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const gravity = 1200; // pixels per second squared
    const jumpVelocity = -400; // pixels per second
    let baseSpeed = 200; // scroll speed
    
    // Entities
    let player = {
      x: 80,
      y: height / 2,
      width: 24,
      height: 24,
      velocity: 0,
      rotation: 0
    };

    let pipes: {x: number, topHeight: number, passed: boolean}[] = [];
    const pipeWidth = 50;
    const pipeGap = 150;
    let spawnTimer = 0;

    let particles: {x: number, y: number, vx: number, vy: number, life: number, maxLife: number}[] = [];
    let trail: {x: number, y: number, alpha: number}[] = [];

    // Background stars (parallax)
    const stars = Array.from({length: 50}).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1
    }));

    const resetGame = () => {
      player = { x: 80, y: height / 2, width: 24, height: 24, velocity: 0, rotation: 0 };
      pipes = [];
      particles = [];
      trail = [];
      spawnTimer = 0;
      baseSpeed = 200;
      setScore(0);
    };

    const spawnPipe = () => {
      const minHeight = 50;
      const maxHeight = height - pipeGap - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      pipes.push({ x: width, topHeight, passed: false });
    };

    const explode = (x: number, y: number) => {
      for (let i = 0; i < 30; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 400,
          vy: (Math.random() - 0.5) * 400,
          life: 1.0,
          maxLife: Math.random() * 0.5 + 0.5
        });
      }
    };

    const handleInput = () => {
      if (gameState === 'START') {
        initAudio();
        resetGame();
        setGameState('PLAYING');
        playSound('jump');
        player.velocity = jumpVelocity;
      } else if (gameState === 'PLAYING') {
        playSound('jump');
        player.velocity = jumpVelocity;
      } else if (gameState === 'GAMEOVER') {
        // Wait a moment before allowing restart
        if (particles.length === 0 || particles[0].life < 0.2) {
          setGameState('START');
        }
      }
    };

    // Keyboard & Mouse/Touch Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleInput();
      }
    };
    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      handleInput();
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown, { passive: false });
    canvas.addEventListener('touchstart', onMouseDown, { passive: false });

    const update = (dt: number) => {
      if (gameState !== 'PLAYING') {
        // Just update particles if game over
        if (gameState === 'GAMEOVER') {
          particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += gravity * dt; // particles fall
            p.life -= dt;
          });
          particles = particles.filter(p => p.life > 0);
        }
        return;
      }

      // Progressive difficulty
      const currentSpeed = baseSpeed + (score * 5); 

      // Update Player
      player.velocity += gravity * dt;
      player.y += player.velocity * dt;
      player.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (player.velocity * 0.1) * (Math.PI / 180)));

      // Add to trail
      if (Math.random() > 0.5) {
        trail.push({ x: player.x, y: player.y, alpha: 1 });
      }
      trail.forEach(t => t.alpha -= dt * 2);
      trail = trail.filter(t => t.alpha > 0);

      // Spawn Pipes
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnPipe();
        spawnTimer = 1.5 * (200 / currentSpeed); // Spawn faster as speed increases
      }

      // Update Pipes & Collisions
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= currentSpeed * dt;

        // Collision Check (AABB)
        const playerBox = { left: player.x - player.width/2 + 4, right: player.x + player.width/2 - 4, top: player.y - player.height/2 + 4, bottom: player.y + player.height/2 - 4 };
        const topPipeBox = { left: p.x, right: p.x + pipeWidth, top: 0, bottom: p.topHeight };
        const botPipeBox = { left: p.x, right: p.x + pipeWidth, top: p.topHeight + pipeGap, bottom: height };

        const hitTop = playerBox.right > topPipeBox.left && playerBox.left < topPipeBox.right && playerBox.bottom > topPipeBox.top && playerBox.top < topPipeBox.bottom;
        const hitBot = playerBox.right > botPipeBox.left && playerBox.left < botPipeBox.right && playerBox.bottom > botPipeBox.top && playerBox.top < botPipeBox.bottom;

        if (hitTop || hitBot) {
          // Crash!
          playSound('crash');
          explode(player.x, player.y);
          setGameState('GAMEOVER');
          if (onGameOver) onGameOver(score);
          return; // Stop updating this frame
        }

        // Scoring
        if (!p.passed && p.x + pipeWidth < player.x) {
          p.passed = true;
          setScore(s => {
            const newScore = s + 1;
            playSound('score');
            return newScore;
          });
        }

        // Remove off-screen pipes
        if (p.x + pipeWidth < 0) {
          pipes.splice(i, 1);
        }
      }

      // Floor / Ceiling Collision
      if (player.y + player.height/2 > height || player.y - player.height/2 < 0) {
        playSound('crash');
        explode(player.x, player.y);
        setGameState('GAMEOVER');
        if (onGameOver) onGameOver(score);
      }
    };

    const draw = () => {
      // Clear & Background
      ctx.fillStyle = '#05050F';
      ctx.fillRect(0, 0, width, height);

      // Draw Parallax Stars
      ctx.fillStyle = '#FFFFFF';
      stars.forEach(star => {
        const speed = gameState === 'PLAYING' ? (baseSpeed + score * 5) * star.speed : 20 * star.speed;
        star.x -= speed * 0.016; // approx dt
        if (star.x < 0) star.x = width;
        
        ctx.globalAlpha = star.size / 3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Pipes
      pipes.forEach(p => {
        // Neon Glow effect for pipes
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#F43F5E';
        ctx.fillStyle = '#9F1239';
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;

        // Top Pipe
        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        ctx.strokeRect(p.x, 0, pipeWidth, p.topHeight);
        // Pipe Cap
        ctx.fillRect(p.x - 4, p.topHeight - 20, pipeWidth + 8, 20);
        ctx.strokeRect(p.x - 4, p.topHeight - 20, pipeWidth + 8, 20);

        // Bottom Pipe
        ctx.fillRect(p.x, p.topHeight + pipeGap, pipeWidth, height);
        ctx.strokeRect(p.x, p.topHeight + pipeGap, pipeWidth, height);
        // Pipe Cap
        ctx.fillRect(p.x - 4, p.topHeight + pipeGap, pipeWidth + 8, 20);
        ctx.strokeRect(p.x - 4, p.topHeight + pipeGap, pipeWidth + 8, 20);
      });
      ctx.shadowBlur = 0; // reset

      // Draw Trail
      trail.forEach(t => {
        ctx.globalAlpha = t.alpha * 0.5;
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(t.x - player.width/2, t.y - player.height/2, player.width, player.height);
      });
      ctx.globalAlpha = 1.0;

      if (gameState === 'PLAYING' || gameState === 'START') {
        // Draw Player
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation);
        
        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#22D3EE';
        
        // Cube body
        ctx.fillStyle = '#0891B2';
        ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
        
        // Neon Border
        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 3;
        ctx.strokeRect(-player.width/2, -player.height/2, player.width, player.height);
        
        // "Eye" or engine core
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(player.width/4 - 2, -4, 4, 8);

        ctx.restore();
      }

      // Draw Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = '#22D3EE';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22D3EE';
        ctx.fillRect(p.x, p.y, 6, 6);
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    };

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      // Cap dt to prevent massive jumps if tab is inactive
      if (dt < 0.1) {
        update(dt);
      }
      draw();
      
      animationFrameId = requestAnimationFrame(loop);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onMouseDown);
    };
  }, [gameState, score, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gray-900 rounded-2xl border border-gray-800 relative">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-white z-10">
        <h2 className="text-xl font-bold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Neon Flyer</h2>
        <span className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">{score}</span>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.15)] border border-white/10 bg-black cursor-pointer"
          style={{ touchAction: 'none' }}
        />
        
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm pointer-events-none">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <svg className="w-8 h-8 text-cyan-400 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Tap or Space to Fly</h3>
            <p className="text-cyan-400 text-sm font-medium">Navigate the neon grid</p>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-md pointer-events-none">
            <h3 className="text-4xl font-black text-rose-500 mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] uppercase tracking-wider">System Failure</h3>
            <p className="text-gray-300 mb-6 font-medium text-lg">Final Score: <span className="text-white font-bold">{score}</span></p>
            <div className="px-8 py-3 bg-cyan-500/10 border border-cyan-400/50 text-cyan-400 rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse">
              Tap to Reboot
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-gray-400 text-sm flex gap-6 z-10">
        <div className="flex items-center gap-2">
          <kbd className="px-3 py-1 bg-gray-800 rounded-md text-xs border border-gray-700 font-bold text-gray-300 shadow-sm">SPACE</kbd>
          <span>or</span>
          <kbd className="px-3 py-1 bg-gray-800 rounded-md text-xs border border-gray-700 font-bold text-gray-300 shadow-sm">TAP</kbd>
          <span className="ml-1">to Thruster</span>
        </div>
      </div>
    </div>
  );
}
