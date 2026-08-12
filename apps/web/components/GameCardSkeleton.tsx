import React from 'react';

export default function GameCardSkeleton() {
  return (
    <div className="flex flex-col bg-[#111228] border border-white/5 rounded-2xl p-3 h-full animate-pulse">
      {/* Image Container Skeleton */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-white/5">
        {/* Category Pill Skeleton */}
        <div className="absolute bottom-2 left-2 z-10">
          <div className="w-16 h-5 bg-white/10 rounded-md"></div>
        </div>
        
        {/* Play Button Skeleton */}
        <div className="absolute bottom-2 right-2 z-10">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-white/10 rounded-full"></div>
        </div>
      </div>
      
      {/* Metadata Skeleton */}
      <div className="flex flex-col px-1 pb-1 mt-auto">
        <div className="w-3/4 h-4 bg-white/10 rounded mb-2.5"></div>
        <div className="flex items-center justify-between">
          <div className="w-12 h-3 bg-white/10 rounded"></div>
          <div className="w-8 h-3 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  );
}
