'use client';

import React from 'react';
import Link from 'next/link';
import {
  ListMusic,
  Play,
  Clock,
  Sparkles,
  Flame,
  ChevronRight,
  Gamepad2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { getAllPlaylists } from '@/lib/playlists';
import { arcadeAudio } from '@/lib/arcade-audio';

export const runtime = 'edge';

export default function PlaylistsPage() {
  const playlists = getAllPlaylists();
  const featured = playlists.find((p) => p.featured) || playlists[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0c16] text-gray-900 dark:text-gray-100 font-sans pb-24 transition-colors">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-1/3 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-indigo-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-indigo-500 font-bold">Game Playlists</span>
        </div>

        {/* Hero Spotlight: Featured Binge Playlist */}
        {featured && (
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#12132b]/95 via-[#18112c]/90 to-[#0e0f20]/95 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-2xl mb-12">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-xs font-black tracking-wider uppercase">
                  <Sparkles size={14} className="text-indigo-400 animate-spin" />
                  <span>Featured Binge Collection</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit text-white tracking-tight leading-tight">
                  <span className="mr-3">{featured.badgeEmoji}</span>
                  {featured.title}
                </h1>

                <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                  {featured.description}
                </p>

                {/* Playlist Info Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                    <Clock size={15} className="text-amber-400" />
                    <span>~{featured.estimatedTotalMinutes} Mins Total</span>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                    <Layers size={15} className="text-indigo-400" />
                    <span>{featured.games.length} Continuous Games</span>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                    <span>Curated by {featured.curator}</span>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href={`/playlists/${featured.slug}`}
                    onClick={() => arcadeAudio.playStart()}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)] transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>Start Binge Play</span>
                  </Link>

                  <Link
                    href={`/playlists/${featured.slug}`}
                    className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <span>View Tracklist</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Game Thumbnails Carousel Preview */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {featured.games.map((g, idx) => (
                  <div
                    key={g.slug}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 hover:border-indigo-400/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/10">
                      <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-white truncate font-outfit">
                        {idx + 1}. {g.title}
                      </span>
                      <span className="text-[10px] text-gray-400">{g.durationMinutes}m • {g.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-outfit text-gray-900 dark:text-white flex items-center gap-2">
              <ListMusic size={22} className="text-indigo-500" />
              All Curated Playlists
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Handcrafted sequences designed to match your gaming mood and available time.
            </p>
          </div>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              href={`/playlists/${pl.slug}`}
              onClick={() => arcadeAudio.playSelect()}
              className="group bg-white dark:bg-[#111227] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{pl.badgeEmoji}</span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                    {pl.games.length} Games
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black font-outfit text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mt-0.5">
                    {pl.tagline}
                  </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {pl.description}
                </p>

                {/* Game Previews */}
                <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {pl.games.slice(0, 4).map((g) => (
                      <img
                        key={g.slug}
                        src={g.image}
                        alt={g.title}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-[#111227] object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 font-mono">
                    ~{pl.estimatedTotalMinutes} mins
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Playlist</span>
                  <ChevronRight size={14} />
                </span>
                <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Play size={13} fill="currentColor" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
