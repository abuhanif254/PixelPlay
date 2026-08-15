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
  ];

  const comingSoon = [
    { id: 'cs1', title: 'Puzzle Lovers', icon: '🧩', gradient: 'from-blue-600 to-indigo-600' },
    { id: 'cs2', title: 'Brain Games',  icon: '🧠', gradient: 'from-emerald-600 to-teal-600' },
  ];

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Collections</h3>
        <Link href="/profile/favorites" className="text-[#6366F1] text-xs font-bold hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        {/* Real Favorites Collection */}
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

        {/* Coming Soon */}
        {comingSoon.map(col => (
          <motion.div
            key={col.id}
            whileHover={{ y: -6, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex flex-col group cursor-pointer opacity-50"
            title="Coming soon"
          >
            <div className={`relative aspect-[4/5] rounded-xl bg-gradient-to-br ${col.gradient} flex flex-col items-center justify-center mb-2 overflow-hidden shadow-lg`}>
              <div className="text-4xl drop-shadow-md mb-1 relative z-10">{col.icon}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-center text-white text-[10px] font-bold z-10">Soon</span>
            </div>
            <h4 className="text-xs font-bold text-gray-500 text-center">{col.title}</h4>
            <p className="text-[10px] text-gray-400 text-center">Coming soon</p>
          </motion.div>
        ))}

        {/* Create New */}
        <motion.div
          whileHover={{ y: -6, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex flex-col group cursor-pointer"
          title="Feature coming soon"
        >
          <div className="relative aspect-[4/5] rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-[#6366F1]/50 bg-gray-50 dark:bg-[#0A0B1A]/50 flex flex-col items-center justify-center mb-2 transition-all">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center group-hover:bg-[#6366F1] group-hover:border-[#6366F1] transition-all">
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-gray-400 text-center group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Create New</h4>
          <p className="text-[10px] text-gray-400 text-center">Coming soon</p>
        </motion.div>

      </div>
    </div>
  );
}
