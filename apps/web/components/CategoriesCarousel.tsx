'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Puzzle, Zap, Mountain, Car, Trophy, Castle, Ghost, Dices, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { name: 'Puzzle', icon: Puzzle, color: 'text-pink-500' },
  { name: 'Action', icon: Zap, color: 'text-orange-500' },
  { name: 'Adventure', icon: Mountain, color: 'text-green-500' },
  { name: 'Racing', icon: Car, color: 'text-blue-500' },
  { name: 'Sports', icon: Trophy, color: 'text-yellow-500' },
  { name: 'Strategy', icon: Castle, color: 'text-purple-500' },
  { name: 'Arcade', icon: Ghost, color: 'text-teal-400' },
  { name: 'Board', icon: Dices, color: 'text-red-500' },
  { name: 'More', icon: MoreHorizontal, color: 'text-gray-400' },
];

export const CategoriesCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.5;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 -mt-8 relative z-20">
      <div className="bg-white dark:bg-[#13142B] border border-black/5 dark:border-white/5 rounded-3xl p-4 flex items-center shadow-2xl">
        
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-gray-500 dark:text-gray-400 transition-colors mr-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-8 md:gap-16 px-4 py-2 scroll-smooth"
        >
          {categories.map((cat) => {
            const href = cat.name === 'More' 
              ? '/categories' 
              : `/categories/${cat.name.toLowerCase()}-games`;
            return (
              <Link 
                key={cat.name} 
                href={href}
                className="flex flex-col items-center justify-center min-w-[60px] group gap-2"
              >
                <cat.icon className={`w-8 h-8 ${cat.color} group-hover:-translate-y-1 transition-transform`} />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-gray-500 dark:text-gray-400 transition-colors ml-2"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Hide scrollbar styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
