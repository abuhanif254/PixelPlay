
import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  gameCount: number;
  icon: LucideIcon;
  colorClass?: string;
}

export default function CategoryCard({ name, gameCount, icon: Icon, colorClass = "text-primary" }: CategoryCardProps) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Link href={`/categories/${slug}`} className="block">
      <div className="group relative p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer transition-all duration-300 hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:shadow-xl hover:-translate-y-1">
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
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </Link>
  );
}
