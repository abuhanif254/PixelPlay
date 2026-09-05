'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Star, Sparkles, Flame, ShieldCheck, Gamepad2 } from 'lucide-react';

interface StageGame {
  title: string;
  slug: string;
  category: string;
  rating: number;
  image_url: string;
  plays: string;
  badge: string;
  badgeColor: string;
}

const DEFAULT_GAMES: StageGame[] = [
  {
    title: 'Only Up Or Lava',
    slug: 'only-up-or-lava',
    category: 'Adventure',
    rating: 4.8,
    image_url: 'https://img.gamemonetize.com/cd2qifsgo6o682uu8vufmuxw7hk851gi/512x384.jpg',
    plays: '75K Plays',
    badge: 'Parkour Hit',
    badgeColor: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Blade Merge',
    slug: 'blade-merge',
    category: 'Strategy',
    rating: 4.9,
    image_url: 'https://img.gamemonetize.com/f8k0kn2o97v51uxbqkf0it3pvsbdw14s/512x384.jpg',
    plays: '120K Plays',
    badge: 'Game of the Day',
    badgeColor: 'from-purple-600 via-indigo-600 to-pink-500',
  },
  {
    title: 'Catchy Ball',
    slug: 'catchy-ball',
    category: 'Sports',
    rating: 4.7,
    image_url: 'https://img.gamemonetize.com/ixwhz13h3za57hm3ke5g6abpm2aanxth/512x384.jpg',
    plays: '50K Plays',
    badge: 'Arcade Classic',
    badgeColor: 'from-blue-500 to-cyan-500',
  },
];

interface HeroGamingStageProps {
  games?: any[];
}

export default function HeroGamingStage({ games }: HeroGamingStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(1); // center card default

  // Mouse position values for 3D parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid mouse tilt
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const stageGames: StageGame[] = (games && games.length >= 3)
    ? [
        {
          title: games[1].title || DEFAULT_GAMES[0].title,
          slug: games[1].slug || DEFAULT_GAMES[0].slug,
          category: games[1].category || 'Action',
          rating: games[1].rating || 4.8,
          image_url: games[1].image_url || games[1].image || DEFAULT_GAMES[0].image_url,
          plays: '85K Plays',
          badge: 'Top Trending',
          badgeColor: 'from-amber-500 to-orange-500',
        },
        {
          title: games[0].title || DEFAULT_GAMES[1].title,
          slug: games[0].slug || DEFAULT_GAMES[1].slug,
          category: games[0].category || 'Strategy',
          rating: games[0].rating || 4.9,
          image_url: games[0].image_url || games[0].image || DEFAULT_GAMES[1].image_url,
          plays: '120K Plays',
          badge: 'Featured Hero',
          badgeColor: 'from-purple-600 via-indigo-600 to-pink-500',
        },
        {
          title: games[2].title || DEFAULT_GAMES[2].title,
          slug: games[2].slug || DEFAULT_GAMES[2].slug,
          category: games[2].category || 'Arcade',
          rating: games[2].rating || 4.7,
          image_url: games[2].image_url || games[2].image || DEFAULT_GAMES[2].image_url,
          plays: '60K Plays',
          badge: 'Hot Release',
          badgeColor: 'from-blue-500 to-cyan-500',
        },
      ]
    : DEFAULT_GAMES;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[460px] sm:h-[500px] lg:h-[560px] flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
    >
      {/* Ambient Neon Atmosphere Glows (Behind Cards) */}
      <div className="absolute w-72 h-72 rounded-full bg-purple-500/25 dark:bg-purple-600/30 blur-[100px] pointer-events-none -top-10 -right-10" />
      <div className="absolute w-72 h-72 rounded-full bg-blue-500/20 dark:bg-blue-600/25 blur-[100px] pointer-events-none -bottom-10 -left-10" />

      {/* Cyber Grid Circle Decoration */}
      <div className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full border border-purple-500/20 dark:border-white/10 pointer-events-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] rounded-full border border-dashed border-indigo-500/20 dark:border-white/5 animate-[spin_40s_linear_infinite]" />
      </div>

      {/* 3D Holographic Stage Container */}
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-full max-w-[480px] h-[380px] sm:h-[420px] flex items-center justify-center"
      >

        {/* Card 0: Left Angled Card */}
        <motion.div
          animate={{
            x: activeCardIndex === 0 ? 0 : -90,
            y: activeCardIndex === 0 ? -10 : 20,
            scale: activeCardIndex === 0 ? 1.05 : 0.86,
            rotateZ: activeCardIndex === 0 ? 0 : -8,
            zIndex: activeCardIndex === 0 ? 30 : 10,
            opacity: activeCardIndex === 0 ? 1 : 0.85,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setActiveCardIndex(0)}
          className="absolute w-[240px] sm:w-[270px] cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="rounded-2xl p-2.5 bg-white/95 dark:bg-[#111228]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-black/50">
              <Image
                src={stageGames[0].image_url}
                alt={stageGames[0].title}
                fill
                sizes="270px"
                className="object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                {stageGames[0].category}
              </div>
            </div>
            <div className="px-1">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                {stageGames[0].title}
              </h4>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3 h-3 fill-current mr-0.5" />
                  {stageGames[0].rating}
                </span>
                <span>{stageGames[0].plays}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Right Angled Card */}
        <motion.div
          animate={{
            x: activeCardIndex === 2 ? 0 : 90,
            y: activeCardIndex === 2 ? -10 : 20,
            scale: activeCardIndex === 2 ? 1.05 : 0.86,
            rotateZ: activeCardIndex === 2 ? 0 : 8,
            zIndex: activeCardIndex === 2 ? 30 : 10,
            opacity: activeCardIndex === 2 ? 1 : 0.85,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setActiveCardIndex(2)}
          className="absolute w-[240px] sm:w-[270px] cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="rounded-2xl p-2.5 bg-white/95 dark:bg-[#111228]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-black/50">
              <Image
                src={stageGames[2].image_url}
                alt={stageGames[2].title}
                fill
                sizes="270px"
                className="object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                {stageGames[2].category}
              </div>
            </div>
            <div className="px-1">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                {stageGames[2].title}
              </h4>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3 h-3 fill-current mr-0.5" />
                  {stageGames[2].rating}
                </span>
                <span>{stageGames[2].plays}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 1: Main Center Hero Card */}
        <motion.div
          animate={{
            x: activeCardIndex === 1 ? 0 : 0,
            y: activeCardIndex === 1 ? -6 : 10,
            scale: activeCardIndex === 1 ? 1 : 0.9,
            zIndex: activeCardIndex === 1 ? 25 : 15,
            opacity: 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setActiveCardIndex(1)}
          className="relative w-[280px] sm:w-[320px] md:w-[340px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="rounded-3xl p-3 sm:p-3.5 bg-white/95 dark:bg-[#111228]/95 backdrop-blur-2xl border-2 border-indigo-500/40 dark:border-purple-500/40 shadow-[0_20px_50px_rgba(99,102,241,0.25)] dark:shadow-[0_25px_60px_rgba(139,92,246,0.35)] transition-all duration-300 group">
            
            {/* Top Badge Overlay */}
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>{stageGames[activeCardIndex].badge}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Instant Ready</span>
              </div>
            </div>

            {/* Thumbnail Viewport with Play Button */}
            <Link 
              href={`/games/${stageGames[activeCardIndex].slug}`} 
              className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden block bg-slate-900 group/thumb mb-3"
            >
              <Image
                src={stageGames[activeCardIndex].image_url}
                alt={stageGames[activeCardIndex].title}
                fill
                sizes="(max-width: 640px) 280px, 340px"
                priority
                className="object-cover transition-transform duration-700 group-hover/thumb:scale-110"
              />
              
              {/* Dark Hover Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.8)] group-hover/thumb:scale-115 transition-transform duration-300">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
              </div>

              {/* Category Tag */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-extrabold uppercase tracking-wider border border-white/15">
                {stageGames[activeCardIndex].category}
              </div>

              {/* Bottom Play Overlay Bar */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-semibold">
                <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md">
                  {stageGames[activeCardIndex].plays}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/80 text-white font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  {stageGames[activeCardIndex].rating}
                </span>
              </div>
            </Link>

            {/* Bottom Controls */}
            <div className="px-1 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  {stageGames[activeCardIndex].title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click card or button to play</p>
              </div>

              <Link
                href={`/games/${stageGames[activeCardIndex].slug}`}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all"
              >
                <span>PLAY</span>
                <Play className="w-3 h-3 fill-current" />
              </Link>
            </div>

          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
