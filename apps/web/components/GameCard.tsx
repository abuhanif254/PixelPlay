import React from 'react';
import { Play, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GameCardProps {
  title: string;
  imageUrl?: string;
  rating?: number;
  category?: string;
  slug?: string;
}

export default function GameCard({ title, imageUrl, rating = 4.5, category = 'Action', slug = '#' }: GameCardProps) {
  return (
    <Link href={slug.startsWith('#') ? slug : `/games/${slug}`} className="block group">
      <div className="flex flex-col bg-white dark:bg-[#13142B] border border-black/5 dark:border-white/5 rounded-2xl p-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#6366F1]/20">
        
        {/* Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-[#0A0B1A]">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest text-xs">
              No Image
            </div>
          )}

          {/* Overlapping Play Button */}
          <div className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-[#13142B] rounded-tl-2xl">
            <div className="w-10 h-10 bg-gray-200 dark:bg-[#25274D] border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-700 dark:text-white group-hover:bg-[#6366F1] group-hover:border-[#6366F1] group-hover:text-white transition-colors shadow-lg shadow-black/10 dark:shadow-black/50">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex items-end justify-between px-1 pb-1">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 truncate max-w-[120px]">{title}</h3>
            <span className="text-xs text-gray-500 font-medium">{category}</span>
          </div>
          <div className="flex items-center text-yellow-500 gap-1 mb-0.5">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
          </div>
        </div>
        
      </div>
    </Link>
  );
}
