import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function PostNavigation() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-b border-white/5 mb-10">
      
      {/* Previous Post */}
      <Link href="#" className="w-full sm:w-1/2 flex items-center gap-4 group hover:bg-[#111228] p-3 rounded-xl transition-colors">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=150&auto=format&fit=crop" 
            alt="Previous post" 
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[#6366F1] text-xs font-bold flex items-center gap-1 mb-1">
            <ArrowLeft size={12} />
            Previous Post
          </span>
          <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors line-clamp-1">
            How to Get Better at Puzzle Games: 7 Expert Tips
          </span>
        </div>
      </Link>

      {/* Divider on desktop */}
      <div className="hidden sm:block w-px h-12 bg-white/5" />

      {/* Next Post */}
      <Link href="#" className="w-full sm:w-1/2 flex items-center justify-end gap-4 group hover:bg-[#111228] p-3 rounded-xl transition-colors text-right">
        <div className="flex flex-col items-end">
          <span className="text-[#6366F1] text-xs font-bold flex items-center justify-end gap-1 mb-1">
            Next Post
            <ArrowRight size={12} />
          </span>
          <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors line-clamp-1">
            Upcoming Browser Games Releasing in May 2024
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=150&auto=format&fit=crop" 
            alt="Next post" 
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        </div>
      </Link>

    </div>
  );
}
