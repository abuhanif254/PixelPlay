'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Brain, Users, ShieldCheck, ArrowUpRight, Play } from 'lucide-react';

interface ZoneItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  count: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  gradient: string;
  borderGlow: string;
  accentColor: string;
  badge: string;
}

const zones: ZoneItem[] = [
  {
    id: 'speed',
    title: 'Speed & Adrenaline',
    subtitle: 'High-octane racing, drift challenges, and 3D highway chases.',
    href: '/categories/car-games',
    count: '1,000+ Games',
    icon: Flame,
    tags: ['Car Games', 'Drifting', 'Stunt Driving', 'Motorbike'],
    gradient: 'from-orange-500/20 via-rose-500/10 to-transparent',
    borderGlow: 'hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]',
    accentColor: 'text-orange-500',
    badge: 'Trending High',
  },
  {
    id: 'mind',
    title: 'Mind Benders & Logic',
    subtitle: 'Tactical puzzles, chess strategy, mahjong, and 2048 classics.',
    href: '/categories/puzzle-games',
    count: '3,450+ Games',
    icon: Brain,
    tags: ['Brain Games', '2048 Online', 'Mahjong', 'Tactical Chess'],
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    borderGlow: 'hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
    accentColor: 'text-purple-400',
    badge: 'Most Popular',
  },
  {
    id: 'coop',
    title: 'Two-Player Arena',
    subtitle: 'Battle side-by-side on one keyboard with friends and rivals.',
    href: '/categories/2-player-games',
    count: '200+ Battles',
    icon: Users,
    tags: ['1v1 Duels', 'Co-op Quests', 'Party Play', 'Stickman Wars'],
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    borderGlow: 'hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
    accentColor: 'text-cyan-400',
    badge: 'Co-op Party',
  },
  {
    id: 'unblocked',
    title: 'Unblocked Anywhere',
    subtitle: 'Lightning-fast cloud HTML5 games playable without restrictions.',
    href: '/categories/unblocked-games',
    count: '17,000+ Ready',
    icon: ShieldCheck,
    tags: ['School Friendly', 'Zero Installs', 'Instant Cloud', 'Arcade Hits'],
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderGlow: 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    accentColor: 'text-emerald-400',
    badge: 'Instant Play',
  },
];

export default function ThematicGamingZones() {
  return (
    <section aria-labelledby="gaming-zones-heading" className="w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Curated Game Hubs</span>
          </div>
          <h2 
            id="gaming-zones-heading"
            className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            Play by Mood & Gaming Vibe
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">
            Handpicked genre clusters engineered for instant gameplay immersion
          </p>
        </div>

        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-sm transition-colors whitespace-nowrap"
        >
          <span>All 25+ Genres</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {zones.map((zone) => {
          const Icon = zone.icon;
          return (
            <Link
              key={zone.id}
              href={zone.href}
              className="group relative block h-full select-none"
            >
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className={`relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#111228]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 overflow-hidden h-full shadow-lg transition-all duration-300 ${zone.borderGlow}`}
              >
                {/* Background Atmosphere Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${zone.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-500 -z-10`} />

                {/* Decorative Top Accent Circle */}
                <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/5 dark:bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                {/* Top Row: Icon + Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ${zone.accentColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10">
                      {zone.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {zone.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                    {zone.subtitle}
                  </p>

                  {/* Tags Cloud */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {zone.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[11px] font-medium text-gray-600 dark:text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Bar: Game Count + Launch Action */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono">
                    {zone.count}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
                    <span>Enter Zone</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
