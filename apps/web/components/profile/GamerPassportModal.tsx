'use client';

import React, { useRef, useState } from 'react';
import { Trophy, Download, Share2, Sparkles, Flame, Zap, Award, X, Check, Gamepad2 } from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';

interface GamerPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streak: number;
  uniqueGames: number;
  achievementsCount: number;
}

export default function GamerPassportModal({
  isOpen,
  onClose,
  username,
  displayName,
  avatarUrl,
  level,
  xp,
  streak,
  uniqueGames,
  achievementsCount,
}: GamerPassportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  // Derive Rank Title
  let rankTitle = 'Arcade Cadet';
  let badgeBorder = 'border-indigo-500';
  let badgeBg = 'bg-indigo-500/20 text-indigo-300';
  let tierColor = '#6366F1';

  if (level >= 25) {
    rankTitle = 'Apex Grandmaster';
    badgeBorder = 'border-rose-500';
    badgeBg = 'bg-rose-500/20 text-rose-300';
    tierColor = '#F43F5E';
  } else if (level >= 15) {
    rankTitle = 'Esports Champion';
    badgeBorder = 'border-amber-500';
    badgeBg = 'bg-amber-500/20 text-amber-300';
    tierColor = '#F59E0B';
  } else if (level >= 10) {
    rankTitle = 'Gold Master';
    badgeBorder = 'border-emerald-500';
    badgeBg = 'bg-emerald-500/20 text-emerald-300';
    tierColor = '#10B981';
  } else if (level >= 5) {
    rankTitle = 'Cyber Veteran';
    badgeBorder = 'border-cyan-500';
    badgeBg = 'bg-cyan-500/20 text-cyan-300';
    tierColor = '#06B6D4';
  }

  // 1-Click HTML5 Canvas PNG Generator and Downloader
  const handleDownloadPng = async () => {
    try {
      setIsGenerating(true);
      arcadeAudio.playSelect();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 630;

      // Dark background with gradients
      ctx.fillStyle = '#070818';
      ctx.fillRect(0, 0, 1200, 630);

      // Radial background glow
      const glow = ctx.createRadialGradient(900, 150, 50, 900, 150, 450);
      glow.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1200, 630);

      // Card Container
      ctx.fillStyle = 'rgba(15, 17, 38, 0.96)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      roundRect(ctx, 40, 40, 1120, 550, 24);
      ctx.fill();
      ctx.stroke();

      // Card Header
      ctx.fillStyle = '#6366F1';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('SPIEL', 80, 105);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('CADE', 175, 105);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('// OFFICIAL GAMER PASSPORT', 280, 103);

      // Rank Pill
      ctx.fillStyle = tierColor;
      roundRect(ctx, 880, 72, 230, 42, 21);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${rankTitle.toUpperCase()}`, 995, 99);
      ctx.textAlign = 'left';

      // Header Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 135);
      ctx.lineTo(1120, 135);
      ctx.stroke();

      // Avatar Border & Box
      ctx.strokeStyle = tierColor;
      ctx.lineWidth = 4;
      roundRect(ctx, 80, 180, 140, 140, 24);
      ctx.stroke();

      // Draw Avatar Image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = avatarUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.save();
          roundRect(ctx, 84, 184, 132, 132, 20);
          ctx.clip();
          ctx.drawImage(img, 84, 184, 132, 132);
          ctx.restore();
          resolve(true);
        };
        img.onerror = () => resolve(false);
      });

      // User details
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(displayName || username, 255, 235);

      ctx.fillStyle = '#A5B4FC';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`@${username}`, 255, 275);

      // Level & Streak Badges
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      roundRect(ctx, 255, 295, 120, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#C7D2FE';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`LEVEL ${level}`, 275, 319);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      roundRect(ctx, 390, 295, 150, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#FCD34D';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`🔥 ${streak} DAY STREAK`, 405, 319);

      // Stats Matrix
      drawStatBox(ctx, 700, 180, 'TOTAL XP', `${xp.toLocaleString()}`, '#FBBF24');
      drawStatBox(ctx, 910, 180, 'GAMES PLAYED', `${uniqueGames}`, '#38BDF8');
      drawStatBox(ctx, 700, 290, 'ACHIEVEMENTS', `${achievementsCount}`, '#A78BFA');
      drawStatBox(ctx, 910, 290, 'STATUS', 'VERIFIED', '#34D399');

      // Footer
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(80, 510);
      ctx.lineTo(1120, 510);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '14px sans-serif';
      ctx.fillText('🔒 VERIFIED ON-CHAIN ARCADIA IDENTITY • NO DOWNLOAD REQUIRED', 80, 545);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`spielcade.com/profile/${username} ➔`, 1120, 545);

      // Trigger instant download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${username}-spielcade-passport.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to export passport:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Web Share or Clipboard Copy
  const handleShare = async () => {
    arcadeAudio.playSelect();
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://spielcade.com/profile/${username}`;
    const shareText = `Check out my Gamer Passport on Spielcade! Level ${level} • ${xp.toLocaleString()} XP • 🔥 ${streak} Day Streak! 🎮`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s Gamer Passport | Spielcade`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0F1126] to-[#080914] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Holographic Glowing Background Highlights */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* Passport Card Presentation */}
        <div className="relative z-10">
          {/* Card Title Strip */}
          <div className="flex items-center justify-between gap-2 mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Arcadia Gamer Passport
              </h2>
            </div>
            <span className={`px-3 py-1 text-xs font-black rounded-full border ${badgeBorder} ${badgeBg}`}>
              ★ {rankTitle}
            </span>
          </div>

          {/* Identity Block */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-black/40 border border-white/5 mb-6">
            <div className={`relative w-24 h-24 rounded-2xl border-2 ${badgeBorder} overflow-hidden bg-black/60 shadow-lg shrink-0`}>
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <h3 className="text-xl sm:text-2xl font-black text-white truncate">{displayName}</h3>
              <p className="text-sm font-bold text-indigo-400">@{username}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-xs font-black text-indigo-300">
                  Level {level}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-black text-amber-300 flex items-center gap-1">
                  <Flame size={12} /> {streak} Day Streak
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-black text-emerald-300">
                  Top {Math.max(1, 100 - level * 3)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-[11px] font-bold text-gray-400 uppercase">Total XP</div>
              <div className="text-lg font-black text-amber-400 font-mono mt-0.5">{xp.toLocaleString()}</div>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-[11px] font-bold text-gray-400 uppercase">Games</div>
              <div className="text-lg font-black text-blue-400 font-mono mt-0.5">{uniqueGames}</div>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-[11px] font-bold text-gray-400 uppercase">Trophies</div>
              <div className="text-lg font-black text-purple-400 font-mono mt-0.5">{achievementsCount}</div>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-[11px] font-bold text-gray-400 uppercase">Status</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">Verified</div>
            </div>
          </div>

          {/* Interactive Action Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download size={16} />
              <span>{isGenerating ? 'Rendering Card...' : 'Download Passport (PNG)'}</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              {isCopied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
              <span>{isCopied ? 'Link Copied!' : 'Share Passport'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Canvas helper function for rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Canvas helper function for stats boxes
function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  title: string,
  val: string,
  color: string
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, 190, 85, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(title, x + 20, y + 30);

  ctx.fillStyle = color;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(val, x + 20, y + 66);
}
