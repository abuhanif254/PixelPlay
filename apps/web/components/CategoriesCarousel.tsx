'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Puzzle, Zap, Mountain, Car, Trophy, Castle, Ghost, Dices, Users, Skull, Crosshair, Flame, ShieldCheck, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface CarouselCategory {
  name: string;
  slug?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const categories: CarouselCategory[] = [
  { name: 'Action', slug: 'action-games', icon: Zap, color: 'text-orange-500' },
  { name: 'Car Games', slug: 'car-games', icon: Car, color: 'text-blue-500' },
  { name: 'Zombie', slug: 'zombie-games', icon: Skull, color: 'text-emerald-500' },
  { name: '2 Player', slug: '2-player-games', icon: Users, color: 'text-indigo-500' },
  { name: 'Shooting', slug: 'shooting-games', icon: Crosshair, color: 'text-red-500' },
  { name: 'Puzzle', slug: 'puzzle-games', icon: Puzzle, color: 'text-pink-500' },
  { name: 'Adventure', slug: 'adventure-games', icon: Mountain, color: 'text-green-500' },
  { name: 'Racing', slug: 'racing-games', icon: Flame, color: 'text-amber-500' },
  { name: 'Sports', slug: 'sports-games', icon: Trophy, color: 'text-yellow-500' },
  { name: 'Strategy', slug: 'strategy-games', icon: Castle, color: 'text-purple-500' },
  { name: 'Arcade', slug: 'arcade-games', icon: Ghost, color: 'text-teal-400' },
  { name: 'Board', slug: 'board-games', icon: Dices, color: 'text-rose-500' },
  { name: 'Unblocked', slug: 'unblocked-games', icon: ShieldCheck, color: 'text-cyan-500' },
  { name: 'All Categories', slug: 'all', icon: MoreHorizontal, color: 'text-gray-400' },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-6 relative z-20">
      <div className="bg-white/90 dark:bg-[#111228]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-3 md:p-4 flex items-center shadow-xl hover:border-purple-500/20 transition-colors">
        
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-purple-500/10 hover:text-purple-500 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors mr-1"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Area with Edge Gradient Mask */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-6 sm:gap-8 md:gap-12 px-4 py-2 scroll-smooth [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]"
        >
          {categories.map((cat) => {
            const href = cat.slug === 'all'
              ? '/categories' 
              : `/categories/${cat.slug || cat.name.toLowerCase() + '-games'}`;
            return (
              <Link 
                key={cat.name} 
                href={href}
                className="flex flex-col items-center justify-center min-w-[64px] group gap-2 shrink-0 py-1"
              >
                <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 group-hover:bg-purple-500/10 border border-transparent group-hover:border-purple-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <cat.icon className={`w-7 h-7 ${cat.color} transition-transform`} />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-white transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-purple-500/10 hover:text-purple-500 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors ml-1"
          aria-label="Scroll categories right"
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

export default CategoriesCarousel;
