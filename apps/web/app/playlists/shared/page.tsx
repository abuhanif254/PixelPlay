'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Share2,
  BookmarkPlus,
  Check,
  Layers,
  ArrowLeft,
  Sparkles,
  Music,
  ExternalLink,
} from 'lucide-react';
import { mixtapeManager, CustomMixtape } from '@/lib/mixtape-manager';
import { arcadeAudio } from '@/lib/arcade-audio';

export const runtime = 'edge';

function SharedMixtapeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawMix = searchParams.get('mix');

  const [mixtape, setMixtape] = useState<CustomMixtape | null>(null);
  const [hasImported, setHasImported] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (rawMix) {
      const decoded = mixtapeManager.decodeMixtapeFromUrl(rawMix);
      if (decoded) {
        setMixtape(decoded);
      }
    }
  }, [rawMix]);

  if (!rawMix || !mixtape) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Music size={48} className="text-gray-500 mb-4" />
        <h1 className="text-2xl font-black font-outfit text-gray-900 dark:text-white mb-2">
          Shared Mixtape Not Found
        </h1>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          This shared mixtape link may be corrupted or expired. You can explore our featured playlists or create your own!
        </p>
        <Link
          href="/playlists"
          className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-bold text-xs shadow-lg hover:bg-indigo-600 transition-colors"
        >
          Explore All Playlists
        </Link>
      </div>
    );
  }

  const handleImport = () => {
    arcadeAudio.playAchievement();
    mixtapeManager.importSharedMixtape(mixtape);
    setHasImported(true);
  };

  const handleShare = async () => {
    arcadeAudio.playSelect();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mixtape.title} - Spielcade Mixtape`,
          text: `Check out this arcade mixtape created by ${mixtape.curatorName}!`,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2500);
      } catch {}
    }
  };

  const firstGameSlug = mixtape.gameSlugs[0] || 'snake';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0c16] text-gray-900 dark:text-gray-100 font-sans pb-24 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/playlists"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>All Playlists</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              {hasCopied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span>{hasCopied ? 'Link Copied!' : 'Share Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleImport}
              disabled={hasImported}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
                hasImported
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25'
              }`}
            >
              {hasImported ? <Check size={13} /> : <BookmarkPlus size={13} />}
              <span>{hasImported ? 'Saved to My Library' : 'Save to Library'}</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111227] p-6 sm:p-8 md:p-10 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${mixtape.gradient} flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shrink-0 border border-white/20`}
            >
              {mixtape.emoji}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/20">
                  Shared Mixtape
                </span>
                <span className="text-xs text-gray-400">Curated by {mixtape.curatorName}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-outfit text-gray-900 dark:text-white">
                {mixtape.title}
              </h1>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                {mixtape.description}
              </p>

              <div className="flex items-center gap-2 pt-2 text-xs font-bold text-gray-400">
                <Layers size={14} className="text-indigo-400" />
                <span>{mixtape.gameSlugs.length} Continuous Games</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center gap-4">
            <Link
              href={`/games/${firstGameSlug}`}
              onClick={() => arcadeAudio.playStart()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)] transform hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={18} fill="currentColor" />
              <span>Start Continuous Binge Play</span>
            </Link>
          </div>
        </div>

        {/* Tracklist */}
        <div className="bg-white dark:bg-[#111227] border border-gray-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
          <h2 className="text-base sm:text-lg font-black font-outfit text-gray-900 dark:text-white mb-4 px-2">
            Games in this Mixtape ({mixtape.gameSlugs.length})
          </h2>

          <div className="space-y-2">
            {mixtape.gameSlugs.map((slug, idx) => {
              const formattedTitle = slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

              return (
                <div
                  key={slug}
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-center text-xs font-black text-gray-400 group-hover:text-indigo-500 font-mono">
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-black font-outfit text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                        {formattedTitle}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono">/games/{slug}</p>
                    </div>
                  </div>

                  <Link
                    href={`/games/${slug}`}
                    onClick={() => arcadeAudio.playSelect()}
                    className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white transition-all shadow-sm active:scale-95"
                    title={`Play ${formattedTitle}`}
                  >
                    <Play size={14} fill="currentColor" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharedMixtapePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-center p-6">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <SharedMixtapeContent />
    </Suspense>
  );
}
