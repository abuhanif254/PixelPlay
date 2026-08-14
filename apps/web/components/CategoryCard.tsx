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
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group h-full relative p-6 rounded-2xl bg-gray-50 dark:bg-[#111228]/80 backdrop-blur-sm border border-gray-200 dark:border-white/5 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-[#6366F1]/50 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)]"
      >
        {/* Background Glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-current to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-2xl" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{gameCount} Games</p>
          </div>
          <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-inner group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
            {icon}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
