'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, Copy, Check, Share2, X, Sparkles, Trophy } from 'lucide-react';
import { copyDataUrlToClipboard, downloadDataUrl } from '@/lib/clip-recorder';
import { arcadeAudio } from '@/lib/arcade-audio';

interface ClipRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  gameTitle: string;
  score?: number;
}

export default function ClipRecorderModal({
  isOpen,
  onClose,
  imageUrl,
  gameTitle,
  score,
}: ClipRecorderModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleCopy = async () => {
    const success = await copyDataUrlToClipboard(imageUrl);
    if (success) {
      setCopied(true);
      arcadeAudio.playBlip();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    arcadeAudio.playAchievement();
    const cleanTitle = gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    downloadDataUrl(imageUrl, `spielcade-${cleanTitle}-highlight.png`);
  };

  const handleShareTwitter = () => {
    const text = `Just hit an epic moment in ${gameTitle}${score ? ` with a score of ${score.toLocaleString()}` : ''} on @Spielcade! 🕹️🔥 Play free: https://spielcade.com`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = `Check out my clutch run in ${gameTitle}${score ? ` (${score.toLocaleString()} pts)` : ''} on Spielcade! 🎮 https://spielcade.com`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0F1026] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Camera size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Clutch Highlight Snapshot</span>
                  <Sparkles size={14} className="text-yellow-400" />
                </h3>
                <p className="text-[11px] text-slate-400">Share your arcade credentials with the world</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Card Preview */}
          <div className="p-6 flex items-center justify-center bg-black/40">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-w-full">
              <img
                src={imageUrl}
                alt={`${gameTitle} Highlight Card`}
                className="w-full h-auto object-contain max-h-[360px] rounded-2xl"
              />
            </div>
          </div>

          {/* Action Deck */}
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-all hover:scale-105 active:scale-95"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Image'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95"
              >
                <Download size={14} />
                <span>Save PNG</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareTwitter}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] text-xs font-bold transition-all"
                title="Share to X (Twitter)"
              >
                <Share2 size={13} />
                <span>X / Twitter</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
                title="Share to WhatsApp"
              >
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
