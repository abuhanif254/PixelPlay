'use client';
import React from 'react';
import Link from 'next/link';
import { Plus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileCollections({ favoriteCount = 0 }: { favoriteCount?: number }) {
  const collections = [
    {
      id: 'favorites',
      title: 'My Favorites',
      games: favoriteCount,
      icon: '💜',
      gradient: 'from-purple-600 to-fuchsia-600',
      shadow: 'shadow-purple-500/20',
      href: '/profile/favorites',
    },
    {
      id: 'puzzle-lovers',
      title: 'Puzzle Lovers',
      games: 10,
      icon: '🧩',
      gradient: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      href: '/playlists/zen-mind',
    },
    {
      id: 'brain-games',
      title: 'Brain Games',
      games: 8,
      icon: '🧠',
      gradient: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      href: '/playlists/coffee-break',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Collections & Playlists</h3>
        <Link href="/playlists" className="text-[#6366F1] text-xs font-bold hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        {/* Real Collections */}
        {collections.map(col => (
          <Link key={col.id} href={col.href}>
            <motion.div
              whileHover={{ y: -6, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex flex-col group cursor-pointer"
            >
              <div className={`relative aspect-[4/5] rounded-xl bg-gradient-to-br ${col.gradient} p-4 flex flex-col items-center justify-center mb-2 overflow-hidden shadow-lg group-hover:shadow-2xl transition-all ${col.shadow}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/10 rounded-full blur-xl mix-blend-overlay" />
                <div className="text-4xl drop-shadow-md mb-1 relative z-10 group-hover:scale-110 transition-transform">{col.icon}</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-2 left-0 right-0 text-center text-white text-[10px] font-bold z-10">
                  {col.games} game{col.games !== 1 ? 's' : ''}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white text-center">{col.title}</h4>
              <p className="text-[10px] text-gray-500 text-center">{col.games} games</p>
            </motion.div>
          </Link>
        ))}

        {/* Create New Mixtape */}
        <Link href="/playlists">
          <motion.div
            whileHover={{ y: -6, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex flex-col group cursor-pointer"
            title="Create your custom gaming playlist"
          >
            <div className="relative aspect-[4/5] rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-[#6366F1]/50 bg-gray-50 dark:bg-[#0A0B1A]/50 flex flex-col items-center justify-center mb-2 transition-all">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center group-hover:bg-[#6366F1] group-hover:border-[#6366F1] transition-all">
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </div>
            </div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center group-hover:text-[#6366F1] transition-colors">Create Mixtape</h4>
            <p className="text-[10px] text-[#6366F1] text-center font-semibold">Custom Mix</p>
          </motion.div>
        </Link>

      </div>
    </div>
  );
}
