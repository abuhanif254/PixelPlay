'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  name: string;
  gameCount: number;
  icon: ReactNode;
  colorClass?: string;
}

export default function CategoryCard({ name, gameCount, icon, colorClass = "text-primary" }: CategoryCardProps) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Link href={`/categories/${slug}`} className="block h-full">
      <motion.div 
        whileHover={{ y: -8, scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="group h-full relative p-6 rounded-2xl bg-gradient-to-b from-white to-gray-50 dark:from-[#1A1B36]/90 dark:to-[#111228]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer hover:border-transparent hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
      >
        {/* Animated Gradient Border on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10" style={{ padding: '2px' }}>
          <div className="w-full h-full bg-white dark:bg-[#111228] rounded-2xl" />
        </div>
        {/* Background Glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-current to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-2xl" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{gameCount} Games</p>
          </div>
          <div className={`p-3 rounded-xl bg-white dark:bg-black/40 shadow-sm border border-gray-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${colorClass}`}>
            {icon}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
