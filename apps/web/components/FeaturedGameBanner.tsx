'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trophy, Play, Star, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface FeaturedGameProps {
  game?: {
    title: string;
    slug: string;
    image_url?: string;
    image?: string;
    category?: string;
    rating?: number;
    description?: string;
    total_plays?: number;
  };
}

export default function FeaturedGameBanner({ game }: FeaturedGameProps) {
  const title = game?.title || 'Blade Merge';
  const slug = game?.slug || 'blade-merge';
  const imageUrl = game?.image_url || game?.image || 'https://img.gamemonetize.com/f8k0kn2o97v51uxbqkf0it3pvsbdw14s/512x384.jpg';
  const category = game?.category || 'Strategy';
  const rating = game?.rating || 4.8;
  const description = game?.description || 'Strategically merge legendary blades, forge elemental powers, and conquer ruthless enemy waves in this addictive browser combat strategy game.';
  const plays = game?.total_plays ? `${Math.floor(game.total_plays / 1000)}K+` : '100K+';

  return (
    <section aria-labelledby="game-of-the-week-heading" className="w-full relative">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0E0F2B] via-[#141538] to-[#0A0B1A] border border-purple-500/20 shadow-2xl">
        
        {/* Background Ambient Glows & Grid */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Background Backdrop Artwork (blurred) */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover blur-2xl scale-125"
            />
          </div>
        )}

        <div className="relative z-10 p-6 md:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Info & CTA (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-extrabold text-xs uppercase tracking-wider shadow-sm">
                <Trophy className="w-3.5 h-3.5 fill-current" />
                <span>Editor&apos;s Pick • Game of the Week</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider">
                {category}
              </span>
            </div>

            {/* Game Title */}
            <h2 
              id="game-of-the-week-heading"
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 font-outfit leading-tight"
            >
              {title}
            </h2>

            {/* Metrics */}
            <div className="flex items-center gap-5 text-sm font-semibold mb-4 text-gray-300">
              <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-lg border border-yellow-400/20">
                <Star className="w-4 h-4 fill-current" />
                <span>{rating.toFixed(1)} / 5.0</span>
              </div>
              <div className="text-gray-400">
                <span className="font-bold text-white">{plays}</span> Plays
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Clean</span>
              </div>
            </div>

            {/* Synopsis */}
            <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/games/${slug}`}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#EC4899] text-white font-bold text-base md:text-lg shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>Play Game Now</span>
              </Link>

              <Link
                href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}-games`}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm md:text-base border border-white/10 transition-all hover:scale-105"
              >
                <span>More {category} Games</span>
                <ArrowRight className="w-4 h-4 text-purple-300" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Game Showcase (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <Link 
              href={`/games/${slug}`}
              className="group relative block w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 group-hover:border-purple-500/50 transition-all duration-500"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-[#181938] flex items-center justify-center text-white text-3xl font-bold">
                  {title}
                </div>
              )}

              {/* Hover Dark Overlay + Play Button */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#EC4899] flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.8)] group-hover:scale-115 transition-transform duration-300">
                  <Play className="w-7 h-7 md:w-9 md:h-9 fill-current ml-1" />
                </div>
              </div>

              {/* Top Banner Tag */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Instant Launch</span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
