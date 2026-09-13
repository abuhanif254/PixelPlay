'use client';

import React, { useState } from 'react';
import { Swords, Share2, Copy, Check, X, Trophy, Sparkles, MessageCircle, Send, Globe } from 'lucide-react';

interface ScoreChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  gameTitle: string;
  gameImage?: string;
  currentScore?: number;
  username?: string;
}

export default function ScoreChallengeModal({
  isOpen,
  onClose,
  slug,
  gameTitle,
  gameImage,
  currentScore = 1500,
  username = 'Player',
}: ScoreChallengeModalProps) {
  const [copied, setCopied] = useState(false);
  const [challengerName, setChallengerName] = useState(username !== 'Player' ? username : '');
  const [scoreToShare, setScoreToShare] = useState<number>(currentScore || 1500);

  if (!isOpen) return null;

  // Formulate the viral URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://spielcade.com';
  const effectiveName = challengerName.trim() || 'A Friend';
  const challengeUrl = `${baseUrl}/games/${slug}?challenger=${encodeURIComponent(effectiveName)}&score=${scoreToShare}`;
  
  const shareText = `🔥 I just scored ${scoreToShare.toLocaleString()} in ${gameTitle} on Spielcade! Can you beat my high score? Accept the challenge here:`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(challengeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Challenge: Beat my score in ${gameTitle}`,
          text: shareText,
          url: challengeUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="relative bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md mb-2 shadow-inner border border-white/20">
            <Swords size={26} className="text-yellow-300" />
          </div>

          <h3 className="text-xl md:text-2xl font-black font-outfit tracking-tight">
            Challenge a Friend!
          </h3>
          <p className="text-xs text-white/90 mt-1 max-w-xs mx-auto">
            Dare your rivals, friends, and group chats to beat your record in {gameTitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Card Preview */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black/40 dark:to-indigo-950/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-black/50 shrink-0 border border-white/10">
              <img
                src={gameImage || 'https://spielcade.com/og-default.jpg'}
                alt={gameTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6366F1] block">
                Viral Rival Match
              </span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {gameTitle}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Score to Beat:</span>
                <span className="text-sm font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {scoreToShare.toLocaleString()} PTS
                </span>
              </div>
            </div>
          </div>

          {/* Name & Custom Score Customizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Your Challenger Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={challengerName}
                onChange={e => setChallengerName(e.target.value)}
                maxLength={24}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#6366F1]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Score to Beat
              </label>
              <input
                type="number"
                value={scoreToShare}
                onChange={e => setScoreToShare(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1]"
              />
            </div>
          </div>

          {/* Challenge Link Input & 1-Click Copy */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Your Unique Viral Challenge Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={challengeUrl}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black/40 text-gray-700 dark:text-gray-300 font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                    : 'bg-[#6366F1] hover:bg-[#5457DF] text-white shadow-[#6366F1]/25'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Social Channels */}
          <div className="space-y-2 pt-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">
              Share Directly to Friends
            </span>
            <div className="grid grid-cols-4 gap-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${challengeUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all text-[11px] font-bold"
              >
                <MessageCircle size={18} className="mb-1" />
                WhatsApp
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(challengeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-all text-[11px] font-bold"
              >
                <Share2 size={18} className="mb-1" />
                X / Twitter
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(challengeUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all text-[11px] font-bold"
              >
                <Send size={18} className="mb-1" />
                Telegram
              </a>

              {/* Native Device Share */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-all text-[11px] font-bold cursor-pointer"
              >
                <Globe size={18} className="mb-1" />
                More
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
