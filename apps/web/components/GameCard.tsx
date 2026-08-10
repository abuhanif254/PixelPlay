
import React from 'react';
import { Play, Star } from 'lucide-react';

interface GameCardProps {
  title: string;
  imageUrl?: string;
  rating: number;
  featured?: boolean;
}

export default function GameCard({ title, imageUrl, rating }: GameCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
      <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">
            <span className="text-sm uppercase tracking-widest font-semibold">No Image</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
          <button className="bg-primary text-black dark:text-white p-4 rounded-full transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-75 shadow-lg shadow-primary/30 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900">
            <Play className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>
      
      <div className="p-4 relative z-10">
        <h3 className="text-lg font-bold text-black dark:text-white mb-1 truncate">{title}</h3>
        <div className="flex items-center text-warning">
          <Star className="w-4 h-4 fill-current mr-1" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
