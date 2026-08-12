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
  plays?: string;
}

export default function GameCard({ 
  title, 
  imageUrl, 
  rating = 4.5, 
  category = 'Action', 
  slug = '#',
  plays = '500K'
}: GameCardProps) {
  return (
    <Link href={slug.startsWith('#') ? slug : `/games/${slug}`} className="block group">
      <div className="flex flex-col bg-[#111228]/80 dark:bg-[#111228]/80 backdrop-blur-md border border-white/5 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]">
        
        {/* Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#0A0B1A]">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest text-xs">
              No Image
            </div>
          )}

          {/* Category Pill overlay */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wider rounded-full uppercase">
              {category}
            </span>
          </div>

          {/* Overlapping Play Button */}
          <div className="absolute bottom-2 right-2 z-10">
            <div className="w-10 h-10 bg-[#6366F1] border border-[#6366F1]/50 rounded-full flex items-center justify-center text-white transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_4px_20px_rgba(99,102,241,0.5)]">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex flex-col px-1 pb-1">
          <h3 className="text-base font-bold text-white mb-1 truncate">{title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400 font-medium">{plays} plays</span>
            <div className="flex items-center text-[#F59E0B] gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
      </div>
    </Link>
  );
}
