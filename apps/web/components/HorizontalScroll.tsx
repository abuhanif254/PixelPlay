'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 z-20 w-11 h-11 flex items-center justify-center bg-white/90 dark:bg-[#111228]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-full shadow-2xl text-gray-800 dark:text-white hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#6366F1] dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pt-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {React.Children.map(children, (child) => (
          <div className="snap-start shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 z-20 w-11 h-11 flex items-center justify-center bg-white/90 dark:bg-[#111228]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-full shadow-2xl text-gray-800 dark:text-white hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#6366F1] dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};
