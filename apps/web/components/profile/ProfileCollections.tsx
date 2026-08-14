'use client';
import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileCollections() {
  const collections = [
    { id: 1, title: 'My Favorites', games: 12, icon: '💜', gradient: 'from-purple-600 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
    { id: 2, title: 'Puzzle Lovers', games: 8, icon: '🧩', gradient: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { id: 3, title: 'Brain Games', games: 15, icon: '🧠', gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20' },
  ];

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Collections</h3>
        <Link href="/profile/collections" className="text-[#6366F1] text-xs font-bold hover:text-white transition-colors">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {collections.map((col) => (
          <motion.div 
            key={col.id} 
            whileHover={{ y: -6, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex flex-col group cursor-pointer"
          >
            <div className={`relative aspect-[4/5] rounded-xl bg-gradient-to-br ${col.gradient} p-4 flex flex-col items-center justify-center mb-2 overflow-hidden shadow-lg group-hover:shadow-2xl transition-all ${col.shadow}`}>
              {/* Decorative background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/10 rounded-full blur-xl mix-blend-overlay"></div>
              
              <div className="text-4xl drop-shadow-md mb-2 relative z-10 group-hover:scale-110 transition-transform">{col.icon}</div>
              
              {/* Subtle glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white text-center">{col.title}</h4>
            <p className="text-xs text-gray-500 text-center">{col.games} games</p>
          </motion.div>
        ))}

        {/* Create New Collection Button */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.05 }}
          className="flex flex-col group cursor-pointer"
        >
          <div className="relative aspect-[4/5] rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-[#6366F1]/50 bg-gray-50 dark:bg-[#0A0B1A]/50 flex flex-col items-center justify-center mb-2 transition-all">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center mb-2 group-hover:bg-[#6366F1] group-hover:border-[#6366F1] transition-all">
              <Plus className="w-5 h-5 text-gray-500 group-hover:text-white" />
            </div>
          </div>
          <h4 className="text-sm font-bold text-gray-400 text-center group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Create New</h4>
          <p className="text-xs text-transparent text-center select-none">.</p> {/* Spacer */}
        </motion.div>
      </div>
    </div>
  );
}
