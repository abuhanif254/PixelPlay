import React from 'react';
import Link from 'next/link';
import { Home, Search, Gamepad2, Compass, Play, Sparkles, Trophy, Flame } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Spielcade Free Online Games',
  description: 'The page or game you are looking for could not be found. Discover thousands of free online browser games on Spielcade.',
  robots: { index: false, follow: false },
};

const FEATURED_GAMES = [
  {
    slug: '2048',
    title: '2048',
    category: 'Puzzle',
    rating: 4.9,
    image: '/images/games/2048.svg',
    badge: 'Popular',
  },
  {
    slug: 'flappy-bird',
    title: 'Neon Flyer',
    category: 'Arcade',
    rating: 4.9,
    image: '/images/games/flappy-bird.svg',
    badge: 'Trending',
  },
  {
    slug: 'snake',
    title: 'Neon Snake',
    category: 'Classic',
    rating: 4.8,
    image: '/images/games/snake.svg',
    badge: 'Retro',
  },
  {
    slug: 'subway-surfers',
    title: 'Subway Surfers',
    category: 'Runner',
    rating: 4.9,
    image: 'https://img.gamemonetize.com/2m65uh7j65l5n91u06hfg75608d8qf41/512x384.jpg',
    badge: 'Top Hit',
  },
  {
    slug: 'slope',
    title: 'Slope Game',
    category: 'Action',
    rating: 4.8,
    image: 'https://img.gamemonetize.com/0i9865f3t8s3q599m85s5v07f76361a8/512x384.jpg',
    badge: '3D Speed',
  },
  {
    slug: 'retro-bowl',
    title: 'Retro Bowl',
    category: 'Sports',
    rating: 4.9,
    image: 'https://img.gamemonetize.com/4g0997h6v5n987q78096h65f9038d152/512x384.jpg',
    badge: 'Favorite',
  },
];

const GENRE_CLUSTERS = [
  { name: 'Car Games', slug: 'car-games', icon: '🚗' },
  { name: '2 Player Games', slug: '2-player-games', icon: '👥' },
  { name: 'Action Games', slug: 'action-games', icon: '⚔️' },
  { name: 'Racing Games', slug: 'racing-games', icon: '🏎️' },
  { name: 'Puzzle Games', slug: 'puzzle-games', icon: '🧩' },
  { name: 'Shooting Games', slug: 'shooting-games', icon: '🎯' },
  { name: 'Unblocked Games', slug: 'unblocked-games', icon: '🔓' },
  { name: 'Runner Games', slug: 'runner-games', icon: '🏃' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070818] pt-24 pb-20 px-4 transition-colors relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-60 right-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* 404 Glitch Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={13} />
          <span>Error 404 • Page or Game Relocated</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-outfit text-slate-900 dark:text-white tracking-tight mb-3">
          Level Not Found!
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
          The link you followed may be outdated, moved, or misspelled. Search over 17,000 free web games or jump straight into a trending title below:
        </p>

        {/* Instant Search Bar */}
        <form
          action="/games"
          method="GET"
          className="max-w-lg mx-auto mb-10 flex items-center gap-2"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="q"
              placeholder="Search by game title, category, or tag..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111228] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white shadow-sm placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Popular Genre Quick-Launch Chips */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Browse Popular Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {GENRE_CLUSTERS.map((genre) => (
              <Link
                key={genre.slug}
                href={`/categories/${genre.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm"
              >
                <span>{genre.icon}</span>
                <span>{genre.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Recommended Games Grid */}
        <div className="mb-12 text-left">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-rose-500" />
              <h2 className="text-base sm:text-lg font-bold font-outfit text-slate-900 dark:text-white">
                Trending Games — Jump Right In
              </h2>
            </div>
            <Link
              href="/games"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All 17,000+ Games →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {FEATURED_GAMES.map((game) => (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="group flex flex-col bg-white dark:bg-[#111228] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-white/5">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                    {game.badge}
                  </div>
                </div>

                <div className="p-2.5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-xs font-bold font-outfit text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {game.category} • ★ {game.rating}
                    </p>
                  </div>

                  <div className="mt-2.5 inline-flex items-center justify-center gap-1 w-full py-1 bg-indigo-600/10 dark:bg-white/5 group-hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 group-hover:text-white rounded-lg text-[11px] font-bold transition-colors">
                    <Play size={10} className="fill-current" />
                    <span>Play</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Global Return Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Home size={15} />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/games"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#111228] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Gamepad2 size={15} className="text-indigo-500" />
            <span>Browse All Games</span>
          </Link>
          <Link
            href="/tournaments"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#111228] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Trophy size={15} className="text-amber-500" />
            <span>Tournaments</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
