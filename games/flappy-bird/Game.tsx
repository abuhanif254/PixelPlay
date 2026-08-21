"use client";

import React, { useEffect, useRef, useState } from 'react';

interface GameProps {
  onGameOver?: (score: number) => void;
}

export default function NeonFlyerGame({ onGameOver }: GameProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 400;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    let animationFrameId: number;
    let lastTime = performance.now();
    
    // Smooth Speed Tracking
    let timeAlive = 0;
    const baseSpeed = 160; // Slower start
    
    const gravity = 1200;
    const jumpVelocity = -400;
    let gridOffset = 0;
    
    let shakeDuration = 0;
    let shakeMagnitude = 0;
    
    let player = { x: 100, y: height / 2, width: 34, height: 20, velocity: 0, rotation: 0 };
    let pipes: {x: number, topHeight: number, passed: boolean}[] = [];
    let particles: {x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string}[] = [];
    let trail: {x: number, y: number, alpha: number, size: number}[] = [];
    let floatTexts: {x: number, y: number, text: string, life: number}[] = [];

    const pipeWidth = 60;
    let pipeGap = 170;
    let spawnTimer = 0;

    // Parallax Cityscapes
    const generateCityscape = (count: number, widthScale: number, heightMin: number, heightMax: number) => {
      let buildings = [];
      let currentX = 0;
      for(let i=0; i<count; i++) {
        let bWidth = Math.random() * 40 + widthScale;
        let bHeight = Math.random() * (heightMax - heightMin) + heightMin;
        buildings.push({ x: currentX, width: bWidth, height: bHeight });
        currentX += bWidth;
      }
      return { buildings, totalWidth: currentX };
    };

    let bgLayer1 = generateCityscape(30, 20, 50, 150); // Distant (slow)
    let bgLayer2 = generateCityscape(30, 30, 100, 250); // Mid (faster)
    let cityOffset1 = 0;
    let cityOffset2 = 0;

    const resetGame = () => {
      player = { x: 100, y: height / 2, width: 34, height: 20, velocity: 0, rotation: 0 };
      pipes = [];
      particles = [];
      trail = [];
      floatTexts = [];
      spawnTimer = 0;
      timeAlive = 0;
      pipeGap = 170;
      shakeDuration = 0;
      setScore(0);
    };

    const spawnPipe = () => {
      const minHeight = 60;
      const maxHeight = height - 100 - pipeGap - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      pipes.push({ x: width, topHeight, passed: false });
    };

    const triggerShake = (duration: number, magnitude: number) => {
      shakeDuration = duration;
      shakeMagnitude = magnitude;
    };

    const explode = (x: number, y: number) => {
      const colors = ['#22D3EE', '#F43F5E', '#FBBF24', '#FFFFFF', '#A855F7'];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 800,
          vy: (Math.random() - 0.5) * 800 - 150,
          life: 1.0,
          maxLife: Math.random() * 1.0 + 0.5,
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
        
        // Spawn ring burst on jump
        particles.push({
          x: player.x, y: player.y, vx: -200, vy: 0, life: 1, maxLife: 0.3, color: '#F43F5E'
        });
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
      if (shakeDuration > 0) shakeDuration -= dt;

      if (gameState !== 'PLAYING') {
        if (gameState === 'GAMEOVER') {
          particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += gravity * 1.5 * dt;
            if (p.y > height - 100) {
              p.y = height - 100;
              p.vy *= -0.5;
              p.vx *= 0.8;
            }
            p.life -= dt;
          });
          particles = particles.filter(p => p.life > 0);
        }
        return;
      }

      timeAlive += dt;
      
      // Smooth Speed Curve
      // Starts at 160. After 30 seconds, it's 250 (160 + 90). After 60 seconds, 340.
      const currentSpeed = baseSpeed + (timeAlive * 3); 
      pipeGap = Math.max(105, 170 - (timeAlive * 1.2)); // Shrinks slowly over time

      gridOffset = (gridOffset + currentSpeed * dt) % 40;
      
      // Parallax City Updates
      cityOffset1 = (cityOffset1 + (currentSpeed * 0.1) * dt) % bgLayer1.totalWidth;
      cityOffset2 = (cityOffset2 + (currentSpeed * 0.3) * dt) % bgLayer2.totalWidth;

      player.velocity += gravity * dt;
      player.y += player.velocity * dt;
      
      const targetRotation = Math.min(Math.PI / 3, Math.max(-Math.PI / 4, (player.velocity * 0.12) * (Math.PI / 180)));
      player.rotation += (targetRotation - player.rotation) * 15 * dt;

      // Exhaust Trail
      trail.push({ 
        x: player.x - player.width/2 * Math.cos(player.rotation) - 10, 
        y: player.y - player.width/2 * Math.sin(player.rotation), 
        alpha: 1.0,
        size: Math.random() * 4 + 4
      });
      trail.forEach(t => {
        t.alpha -= dt * 4;
        t.size -= dt * 10;
      });
      trail = trail.filter(t => t.alpha > 0);
      
      // Floating Texts
      floatTexts.forEach(ft => {
        ft.y -= 50 * dt;
        ft.life -= dt;
      });
      floatTexts = floatTexts.filter(ft => ft.life > 0);

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnPipe();
        spawnTimer = 1.8 * (160 / currentSpeed);
      }

      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= currentSpeed * dt;

        const hitMarginX = 8;
        const hitMarginY = 6;
        const playerBox = { 
          left: player.x - player.width/2 + hitMarginX, 
          right: player.x + player.width/2 - hitMarginX, 
          top: player.y - player.height/2 + hitMarginY, 
          bottom: player.y + player.height/2 - hitMarginY 
        };
        const topPipeBox = { left: p.x, right: p.x + pipeWidth, top: 0, bottom: p.topHeight };
        const botPipeBox = { left: p.x, right: p.x + pipeWidth, top: p.topHeight + pipeGap, bottom: height - 100 };

        const hitTop = playerBox.right > topPipeBox.left && playerBox.left < topPipeBox.right && playerBox.bottom > topPipeBox.top && playerBox.top < topPipeBox.bottom;
        const hitBot = playerBox.right > botPipeBox.left && playerBox.left < botPipeBox.right && playerBox.bottom > botPipeBox.top && playerBox.top < botPipeBox.bottom;

        if (hitTop || hitBot) {
          triggerShake(0.6, 25);
          playSound('crash');
          explode(player.x, player.y);
          setGameState('GAMEOVER');
          if (onGameOver) onGameOver(score);
          return;
        }

        if (!p.passed && p.x + pipeWidth < player.x) {
          p.passed = true;
          setScore(s => s + 1);
          playSound('score');
          floatTexts.push({ x: player.x + 20, y: player.y - 30, text: "+1", life: 1.0 });
        }

        if (p.x + pipeWidth < 0) pipes.splice(i, 1);
      }

      if (player.y + player.height/2 > height - 100 || player.y - player.height/2 < 0) {
        triggerShake(0.6, 25);
        playSound('crash');
        explode(player.x, player.y);
        setGameState('GAMEOVER');
        if (onGameOver) onGameOver(score);
      }
    };

    const draw = () => {
      ctx.save();
      if (shakeDuration > 0) {
        ctx.translate((Math.random() - 0.5) * shakeMagnitude, (Math.random() - 0.5) * shakeMagnitude);
      }

      // Deep Synthwave Sky
      const gradient = ctx.createLinearGradient(0, 0, 0, height - 100);
      gradient.addColorStop(0, '#0F0C29');
      gradient.addColorStop(0.5, '#302B63');
      gradient.addColorStop(1, '#240B36');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Sun
      ctx.fillStyle = '#FF416C';
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#FF4B2B';
      ctx.beginPath();
      ctx.arc(width / 2, height - 100, 100, Math.PI, 0);
      
      // Sun cutouts
      for(let i = 0; i < 5; i++) {
        ctx.rect(width/2 - 110, height - 100 - (i * 15) - 5, 220, 5);
      }
      ctx.fill('evenodd');
      ctx.shadowBlur = 0;

      // Parallax Cityscapes
      const drawCity = (layer: any, offset: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        let drawX = -offset;
        
        while (drawX < width) {
          layer.buildings.forEach((b: any) => {
            if (drawX + b.width > 0 && drawX < width) {
              ctx.rect(drawX, height - 100 - b.height, b.width, b.height);
            }
            drawX += b.width;
          });
        }
        ctx.fill();
      };
      drawCity(bgLayer1, cityOffset1, '#1A1025'); // Distant dark buildings
      drawCity(bgLayer2, cityOffset2, '#2D1B4E'); // Closer mid-tone buildings

      // Draw Pipes (High-tech metallic with neon core)
      pipes.forEach(p => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
        
        // Pipe Body
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;

        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        ctx.strokeRect(p.x, 0, pipeWidth, p.topHeight);
        
        ctx.fillRect(p.x, p.topHeight + pipeGap, pipeWidth, height - 100 - (p.topHeight + pipeGap));
        ctx.strokeRect(p.x, p.topHeight + pipeGap, pipeWidth, height - 100 - (p.topHeight + pipeGap));
        
        // Glowing Core Line
        ctx.fillStyle = '#67E8F9';
        ctx.fillRect(p.x + pipeWidth/2 - 2, 0, 4, p.topHeight);
        ctx.fillRect(p.x + pipeWidth/2 - 2, p.topHeight + pipeGap, 4, height);

        // Pipe Caps (Thicker)
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(p.x - 4, p.topHeight - 20, pipeWidth + 8, 20);
        ctx.strokeRect(p.x - 4, p.topHeight - 20, pipeWidth + 8, 20);
        
        ctx.fillRect(p.x - 4, p.topHeight + pipeGap, pipeWidth + 8, 20);
        ctx.strokeRect(p.x - 4, p.topHeight + pipeGap, pipeWidth + 8, 20);
      });
      ctx.shadowBlur = 0;

      // Draw 3D Grid Floor
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, height - 100, width, 100);
      
      ctx.strokeStyle = '#D946EF'; 
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#D946EF';
      
      for (let y = gridOffset; y < 100; y += 20) {
        const perspectiveY = (y * y) / 100; 
        ctx.beginPath();
        ctx.moveTo(0, height - 100 + perspectiveY);
        ctx.lineTo(width, height - 100 + perspectiveY);
        ctx.stroke();
      }
      
      const vanishingPointX = width / 2;
      for (let x = -width; x <= width * 2; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(vanishingPointX + (x - vanishingPointX) * 0.1, height - 100);
        ctx.stroke();
      }
      
      ctx.strokeStyle = '#22d3ee'; // Cyan horizon line
      ctx.lineWidth = 4;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(0, height - 100);
      ctx.lineTo(width, height - 100);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Trail (Engine Exhaust)
      trail.forEach(t => {
        ctx.globalAlpha = t.alpha;
        ctx.fillStyle = '#F43F5E';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#F43F5E';
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(0, t.size), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      if (gameState === 'PLAYING' || gameState === 'START') {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#38BDF8';
        
        // Ship Hull (Sleek Fighter)
        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath();
        ctx.moveTo(player.width/2 + 5, 0); // Pointy Nose
        ctx.lineTo(-player.width/2, -player.height/2 - 5); // Top Fin
        ctx.lineTo(-player.width/4, 0); // Engine well
        ctx.lineTo(-player.width/2, player.height/2 + 5); // Bottom Fin
        ctx.closePath();
        ctx.fill();
        
        // Ship Trim / Wings
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Cockpit window
        ctx.fillStyle = '#0EA5E9';
        ctx.beginPath();
        ctx.moveTo(player.width/4, -3);
        ctx.lineTo(-player.width/8, -player.height/3);
        ctx.lineTo(-player.width/8, 0);
        ctx.fill();

        ctx.restore();
      }

      // Draw Particles (Explosion)
      particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        
        // Draw little shards instead of circles for explosions
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 10);
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Draw Floating Texts
      floatTexts.forEach(ft => {
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 24px system-ui';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#34D399';
        ctx.fillText(ft.text, ft.x, ft.y);
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Post-Processing Vignette / CRT overlay
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for(let i=0; i<height; i+=4) {
        ctx.fillRect(0, i, width, 1);
      }
      const grad = ctx.createRadialGradient(width/2, height/2, height/3, width/2, height/2, height);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.restore(); 
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
