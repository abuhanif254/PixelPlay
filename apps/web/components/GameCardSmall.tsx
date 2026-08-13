import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface GameCardSmallProps {
  title: string;
  slug: string;
  rating?: number;
  imageUrl?: string;
}

export default function GameCardSmall({ title, slug, rating = 4.5, imageUrl }: GameCardSmallProps) {
  return (
    <Link 
      href={`/games/${slug}`}
      className="group flex flex-col gap-2 rounded-xl transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#111228] border border-white/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-gradient-to-br from-[#111228] to-[#1D1B4B]">
            {title}
          </div>
        )}
      </div>
      
      <div className="flex flex-col px-1">
        <h4 className="text-sm font-bold text-white truncate group-hover:text-[#6366F1] transition-colors">
          {title}
        </h4>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-0.5 text-[#F59E0B]">
            <Star size={12} className="fill-current" />
            <Star size={12} className="fill-current" />
          </div>
          <span className="text-xs font-medium text-gray-400">{rating}</span>
        </div>
      </div>
    </Link>
  );
}
