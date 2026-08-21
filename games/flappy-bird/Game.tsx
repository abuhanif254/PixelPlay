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
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
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
    
    const gravity = 1400; // pixels per second squared
    const jumpVelocity = -450; // pixels per second
    let baseSpeed = 220; // scroll speed
    let gridOffset = 0; // for the synthwave floor
    
    // Screen Shake
    let shakeDuration = 0;
    let shakeMagnitude = 0;
    
    // Entities
    let player = {
      x: 100,
      y: height / 2,
      width: 30,
      height: 20,
      velocity: 0,
      rotation: 0
    };

    let pipes: {x: number, topHeight: number, passed: boolean}[] = [];
    const pipeWidth = 60;
    let pipeGap = 160;
    let spawnTimer = 0;

    let particles: {x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string}[] = [];
    let trail: {x: number, y: number, alpha: number}[] = [];

    // Background stars (parallax)
    const stars = Array.from({length: 60}).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height - 100), // Keep stars above the grid floor
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1
    }));

    const resetGame = () => {
      player = { x: 100, y: height / 2, width: 30, height: 20, velocity: 0, rotation: 0 };
      pipes = [];
      particles = [];
      trail = [];
      spawnTimer = 0;
      baseSpeed = 220;
      pipeGap = 160;
      shakeDuration = 0;
      setScore(0);
    };

    const spawnPipe = () => {
      const minHeight = 60;
      const maxHeight = height - 100 - pipeGap - minHeight; // Leave room for 100px floor
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      pipes.push({ x: width, topHeight, passed: false });
    };

    const triggerShake = (duration: number, magnitude: number) => {
      shakeDuration = duration;
      shakeMagnitude = magnitude;
    };

    const explode = (x: number, y: number) => {
      const colors = ['#22D3EE', '#F43F5E', '#FBBF24', '#ffffff'];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 600,
          vy: (Math.random() - 0.5) * 600 - 100, // Slight upward burst
          life: 1.0,
          maxLife: Math.random() * 0.8 + 0.4,
          color: colors[Math.floor(Math.random() * colors.length)]
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
        if (particles.length === 0 || particles[0].life < 0.2) {
          setGameState('START');
        }
      }
    };

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
      if (shakeDuration > 0) {
        shakeDuration -= dt;
      }

      if (gameState !== 'PLAYING') {
        // Update particles falling during game over
        if (gameState === 'GAMEOVER') {
          particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += gravity * 1.5 * dt; // Gravity
            // Bounce off the grid floor
            if (p.y > height - 100) {
              p.y = height - 100;
              p.vy *= -0.5; // Bounce friction
              p.vx *= 0.8;
            }
            p.life -= dt;
          });
          particles = particles.filter(p => p.life > 0);
        }
        return;
      }

      // Progressive difficulty
      const currentSpeed = baseSpeed + (score * 6); 
      // Shrink pipe gap slightly over time, down to a minimum of 110
      pipeGap = Math.max(110, 160 - (score * 1.5));

      // Synthwave floor scrolling
      gridOffset = (gridOffset + currentSpeed * dt) % 40;

      // Update Player
      player.velocity += gravity * dt;
      player.y += player.velocity * dt;
      
      // Dynamic rotation based on velocity (nose up when jumping, nose down when falling)
      const targetRotation = Math.min(Math.PI / 3, Math.max(-Math.PI / 4, (player.velocity * 0.12) * (Math.PI / 180)));
      // Smooth out the rotation
      player.rotation += (targetRotation - player.rotation) * 15 * dt;

      // Add to trail (exhaust)
      if (Math.random() > 0.3) {
        trail.push({ 
          x: player.x - player.width/2 * Math.cos(player.rotation), 
          y: player.y - player.width/2 * Math.sin(player.rotation), 
          alpha: 1 
        });
      }
      trail.forEach(t => t.alpha -= dt * 3);
      trail = trail.filter(t => t.alpha > 0);

      // Spawn Pipes
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnPipe();
        spawnTimer = 1.6 * (220 / currentSpeed);
      }

      // Update Pipes & Collisions
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= currentSpeed * dt;

        // Collision Check (AABB with slightly forgiving hitbox)
        const hitMarginX = 6;
        const hitMarginY = 6;
        const playerBox = { 
          left: player.x - player.width/2 + hitMarginX, 
          right: player.x + player.width/2 - hitMarginX, 
          top: player.y - player.height/2 + hitMarginY, 
          bottom: player.y + player.height/2 - hitMarginY 
        };
        const topPipeBox = { left: p.x, right: p.x + pipeWidth, top: 0, bottom: p.topHeight };
        const botPipeBox = { left: p.x, right: p.x + pipeWidth, top: p.topHeight + pipeGap, bottom: height - 100 }; // Floor at bottom

        const hitTop = playerBox.right > topPipeBox.left && playerBox.left < topPipeBox.right && playerBox.bottom > topPipeBox.top && playerBox.top < topPipeBox.bottom;
        const hitBot = playerBox.right > botPipeBox.left && playerBox.left < botPipeBox.right && playerBox.bottom > botPipeBox.top && playerBox.top < botPipeBox.bottom;

        if (hitTop || hitBot) {
          triggerShake(0.4, 15);
          playSound('crash');
          explode(player.x, player.y);
          setGameState('GAMEOVER');
          if (onGameOver) onGameOver(score);
          return;
        }

        // Scoring
        if (!p.passed && p.x + pipeWidth < player.x) {
          p.passed = true;
          setScore(s => {
            playSound('score');
            return s + 1;
          });
        }

        // Remove off-screen pipes
        if (p.x + pipeWidth < 0) {
          pipes.splice(i, 1);
        }
      }

      // Floor / Ceiling Collision
      if (player.y + player.height/2 > height - 100 || player.y - player.height/2 < 0) {
        triggerShake(0.5, 20);
        playSound('crash');
        explode(player.x, player.y);
        setGameState('GAMEOVER');
        if (onGameOver) onGameOver(score);
      }
    };

    const draw = () => {
      ctx.save();

      // Apply screen shake
      if (shakeDuration > 0) {
        const dx = (Math.random() - 0.5) * shakeMagnitude;
        const dy = (Math.random() - 0.5) * shakeMagnitude;
        ctx.translate(dx, dy);
      }

      // Deep synthwave background
      const gradient = ctx.createLinearGradient(0, 0, 0, height - 100);
      gradient.addColorStop(0, '#020024');
      gradient.addColorStop(0.5, '#090979');
      gradient.addColorStop(1, '#ff007f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Parallax Stars
      ctx.fillStyle = '#FFFFFF';
      stars.forEach(star => {
        const speed = gameState === 'PLAYING' ? (baseSpeed + score * 6) * star.speed : 20 * star.speed;
        star.x -= speed * 0.016;
        if (star.x < 0) star.x = width;
        
        ctx.globalAlpha = star.size / 3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Draw Sun (Synthwave aesthetic)
      ctx.fillStyle = '#ffb703';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#fb8500';
      ctx.beginPath();
      ctx.arc(width / 2, height - 100, 80, Math.PI, 0); // Semicircle on the horizon
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Pipes
      pipes.forEach(p => {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#06b6d4'; // Cyan glow
        ctx.fillStyle = '#083344'; // Dark interior
        ctx.strokeStyle = '#22d3ee'; // Bright border
        ctx.lineWidth = 3;

        // Top Pipe
        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        ctx.strokeRect(p.x, 0, pipeWidth, p.topHeight);
        // Top Cap
        ctx.fillRect(p.x - 6, p.topHeight - 20, pipeWidth + 12, 20);
        ctx.strokeRect(p.x - 6, p.topHeight - 20, pipeWidth + 12, 20);

        // Bottom Pipe
        ctx.fillRect(p.x, p.topHeight + pipeGap, pipeWidth, height - 100 - (p.topHeight + pipeGap));
        ctx.strokeRect(p.x, p.topHeight + pipeGap, pipeWidth, height - 100 - (p.topHeight + pipeGap));
        // Bottom Cap
        ctx.fillRect(p.x - 6, p.topHeight + pipeGap, pipeWidth + 12, 20);
        ctx.strokeRect(p.x - 6, p.topHeight + pipeGap, pipeWidth + 12, 20);
      });
      ctx.shadowBlur = 0;

      // Draw 3D Grid Floor
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, height - 100, width, 100);
      
      ctx.strokeStyle = '#f43f5e'; // Magenta grid
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f43f5e';
      
      // Horizontal scrolling lines
      for (let y = gridOffset; y < 100; y += 20) {
        // Pseudo 3D perspective effect
        const perspectiveY = (y * y) / 100; // Exponential curve for distance
        ctx.beginPath();
        ctx.moveTo(0, height - 100 + perspectiveY);
        ctx.lineTo(width, height - 100 + perspectiveY);
        ctx.stroke();
      }
      
      // Vertical receding lines
      const vanishingPointX = width / 2;
      const vanishingPointY = height - 120; // Above the floor line
      for (let x = -width; x <= width * 2; x += 40) {
        ctx.beginPath();
        // Start line from bottom of screen, draw towards vanishing point
        ctx.moveTo(x, height);
        ctx.lineTo(vanishingPointX + (x - vanishingPointX) * 0.2, height - 100);
        ctx.stroke();
      }
      
      // Floor Horizon Line
      ctx.strokeStyle = '#22d3ee'; // Cyan horizon
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, height - 100);
      ctx.lineTo(width, height - 100);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Trail
      trail.forEach((t, i) => {
        ctx.globalAlpha = t.alpha * 0.8;
        ctx.fillStyle = '#f43f5e'; // Pink thruster trail
        const size = (trail.length - i) * 0.5 + 4; // Taper off
        ctx.beginPath();
        ctx.arc(t.x, t.y, size/2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      if (gameState === 'PLAYING' || gameState === 'START') {
        // Draw Player Ship (Stylized Triangle/Jet)
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fbbf24'; // Yellow glow
        
        // Ship Body
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.moveTo(player.width/2, 0); // Nose
        ctx.lineTo(-player.width/2, -player.height/2); // Top wing
        ctx.lineTo(-player.width/4, 0); // Back indent
        ctx.lineTo(-player.width/2, player.height/2); // Bottom wing
        ctx.closePath();
        ctx.fill();
        
        // Neon trim
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // Draw Particles (Explosion)
      particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.random() * 3 + 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      ctx.restore(); // Restore shake translation
    };

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      if (dt < 0.1) {
        update(dt);
      }
      draw();
      
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onMouseDown);
    };
  }, [gameState, score, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gray-950 rounded-2xl border border-gray-800 relative">
      <div className="flex justify-between w-full max-w-[400px] mb-4 text-white z-10">
        <h2 className="text-2xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 uppercase tracking-widest italic">Neon Flyer</h2>
        <div className="bg-black/50 px-4 py-1 rounded-lg border border-cyan-500/30">
           <span className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">{score}</span>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-xl shadow-[0_0_50px_rgba(244,63,94,0.2)] border-2 border-pink-500/20 bg-black cursor-pointer overflow-hidden"
          style={{ touchAction: 'none' }}
        />
        
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-xl backdrop-blur-[2px] pointer-events-none">
            <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse border-2 border-pink-400/50 shadow-[0_0_30px_rgba(244,63,94,0.6)]">
              <svg className="w-10 h-10 text-pink-400 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-lg">Engage</h3>
            <p className="text-pink-400 text-sm font-bold tracking-widest uppercase">Tap or Space to Thruster</p>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl backdrop-blur-md pointer-events-none">
            <h3 className="text-5xl font-black text-rose-500 mb-2 drop-shadow-[0_0_20px_rgba(225,29,72,0.8)] uppercase tracking-widest">CRASHED</h3>
            <p className="text-gray-300 mb-8 font-medium text-xl uppercase tracking-widest">Score: <span className="text-white font-black">{score}</span></p>
            <div className="px-10 py-4 bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 rounded-full font-black uppercase tracking-widest text-sm shadow-[0_0_25px_rgba(34,211,238,0.4)] animate-pulse">
              Tap to Reboot
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-gray-400 text-sm flex gap-6 z-10">
        <div className="flex items-center gap-2">
          <kbd className="px-3 py-1 bg-gray-900 rounded-md text-xs border border-gray-700 font-bold text-gray-300 shadow-sm">SPACE</kbd>
          <span className="uppercase tracking-widest text-xs">or</span>
          <kbd className="px-3 py-1 bg-gray-900 rounded-md text-xs border border-gray-700 font-bold text-gray-300 shadow-sm">TAP</kbd>
        </div>
      </div>
    </div>
  );
}
