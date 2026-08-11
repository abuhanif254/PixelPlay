
import React from 'react';
import { Play, Star } from 'lucide-react';
import Image from 'next/image';

interface GameCardProps {
  title: string;
  imageUrl?: string;
  rating?: number;
  featured?: boolean;
}

export default function GameCard({ title, imageUrl, rating, featured }: GameCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border ${featured ? 'border-primary/50 shadow-primary/10' : 'border-gray-200 dark:border-gray-800'} transition-all duration-300 hover:shadow-[0_0_25px_rgba(79,70,229,0.25)] hover:border-primary/40 hover:-translate-y-1`}>
      <div className={`${featured ? 'aspect-[21/9]' : 'aspect-video'} w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden`}>
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">
            <span className="text-sm uppercase tracking-widest font-semibold">No Image</span>
          </div>
        )}
        
        {featured && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]">
            Editor's Pick
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
          <button className="bg-primary text-white p-4 rounded-full transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-75 shadow-[0_0_20px_rgba(79,70,229,0.6)] hover:bg-accent hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:outline-none">
            <Play className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>
      
      <div className="p-4 relative z-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">{title}</h3>
        <div className="flex items-center text-warning">
          <Star className="w-4 h-4 fill-current mr-1 drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]" />
          <span className="text-sm font-medium drop-shadow-sm">{rating ? rating.toFixed(1) : 'New'}</span>
        </div>
      </div>
    </div>
  );
}
