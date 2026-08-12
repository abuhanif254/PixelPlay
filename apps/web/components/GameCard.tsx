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
  isNew?: boolean;
}

export default function GameCard({ 
  title, 
  imageUrl, 
  rating = 4.5, 
  category = 'Action', 
  slug = '#',
  plays = '500K',
  isNew = false
}: GameCardProps) {
  return (
    <Link href={slug.startsWith('#') ? slug : `/games/${slug}`} className="block group">
      <div className="flex flex-col bg-[#111228] border border-white/5 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#6366F1]/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] h-full">
        
        {/* Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#0A0B1A]">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest text-xs">
              No Image
            </div>
          )}

          {/* NEW Badge overlay */}
          {isNew && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-bold tracking-wider rounded-sm uppercase shadow-md">
                NEW
              </span>
            </div>
          )}

          {/* Category Pill overlay */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-1 bg-[#0A0B1A]/90 text-gray-200 text-[10px] font-bold tracking-wider rounded-md uppercase">
              {category}
            </span>
          </div>

          {/* Always Visible Play Button */}
          <div className="absolute bottom-2 right-2 z-10">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#6366F1] rounded-full flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-[#6366F1]/40">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex flex-col px-1 pb-1 mt-auto">
          <h3 className="text-[15px] font-bold text-gray-100 mb-1.5 truncate group-hover:text-[#6366F1] transition-colors">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">{plays}</span>
            <div className="flex items-center text-[#F59E0B] gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11px] font-bold text-gray-200">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
      </div>
    </Link>
  );
}
