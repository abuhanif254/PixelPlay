'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Play,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Sparkles,
  Layers,
  ChevronRight,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { getPlaylistBySlug } from '@/lib/playlists';
import { arcadeAudio } from '@/lib/arcade-audio';

export const runtime = 'edge';

interface PlaylistPageProps {
  params: {
    slug: string;
  };
}

export default function PlaylistDetailPage({ params }: PlaylistPageProps) {
  const playlist = getPlaylistBySlug(params.slug);
  const [copied, setCopied] = useState(false);

  if (!playlist) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-black font-outfit text-gray-900 dark:text-white mb-2">
          Playlist Not Found
        </h1>
        <p className="text-sm text-gray-500 mb-6">The requested gaming playlist could not be located.</p>
        <Link
          href="/playlists"
          className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-xs"
        >
          Back to All Playlists
        </Link>
      </div>
    );
  }

  const handleShare = async () => {
    arcadeAudio.playSelect();
    const url = typeof window !== 'undefined' ? window.location.href : `https://spielcade.com/playlists/${playlist.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${playlist.title} - Spielcade Playlist`,
          text: playlist.description,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const firstGame = playlist.games[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0c16] text-gray-900 dark:text-gray-100 font-sans pb-24 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Breadcrumb & Share */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/playlists"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>All Playlists</span>
          </Link>

          <button
            onClick={handleShare}
            type="button"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
            <span>{copied ? 'Link Copied!' : 'Share Playlist'}</span>
          </button>
        </div>

        {/* Playlist Hero Deck */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111227] p-6 sm:p-8 md:p-10 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Big Emoji / Art Pod */}
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${playlist.coverGradient} flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shrink-0 border border-white/20`}>
              {playlist.badgeEmoji}
            </div>

            {/* Meta Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                  Curated Collection
                </span>
                <span className="text-xs text-gray-400">By {playlist.curator}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-outfit text-gray-900 dark:text-white">
                {playlist.title}
              </h1>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                {playlist.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <Layers size={14} className="text-indigo-400" />
                  {playlist.games.length} Games
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-amber-400" />
                  ~{playlist.estimatedTotalMinutes} Minutes Duration
                </span>
              </div>
            </div>
          </div>

          {/* Binge Play Action Button */}
          {firstGame && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <Link
                href={`/games/${firstGame.slug}?playlist=${playlist.slug}&queueIndex=0`}
                onClick={() => arcadeAudio.playStart()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)] transform hover:scale-105 active:scale-95 transition-all"
              >
                <Play size={18} fill="currentColor" />
                <span>Start Continuous Binge Play</span>
              </Link>
            </div>
          )}
        </div>

        {/* Numbered Queue List */}
        <div className="bg-white dark:bg-[#111227] border border-gray-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
          <h2 className="text-base sm:text-lg font-black font-outfit text-gray-900 dark:text-white mb-4 px-2">
            Games in Queue ({playlist.games.length})
          </h2>

          <div className="space-y-2">
            {playlist.games.map((game, index) => (
              <div
                key={game.slug}
                className="flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <span className="w-6 text-center text-xs sm:text-sm font-black text-gray-400 group-hover:text-indigo-500 font-mono">
                    {index + 1}
                  </span>

                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-gray-200 dark:border-white/10">
                    <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black font-outfit text-gray-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                      {game.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                      <span className="text-[10px] text-gray-400">{game.durationMinutes}m</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300">
                        {game.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-mono font-bold text-gray-400">{game.durationMinutes} mins</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{game.difficulty}</span>
                  </div>

                  <Link
                    href={`/games/${game.slug}?playlist=${playlist.slug}&queueIndex=${index}`}
                    onClick={() => arcadeAudio.playSelect()}
                    className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white transition-all shadow-sm active:scale-95"
                    title={`Play ${game.title}`}
                  >
                    <Play size={14} fill="currentColor" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
