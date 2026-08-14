import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CategoryData } from '@/lib/mockCategories';

export default function CategoryHero({ category }: { category: CategoryData }) {
  return (
    <div className="w-full bg-white dark:bg-[#05050F] relative overflow-hidden border-b border-gray-200 dark:border-white/5 mb-8 transition-colors duration-300">
      {/* Background Glows */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[400px] blur-[120px] rounded-full pointer-events-none opacity-10 dark:opacity-20"
        style={{ backgroundColor: category.color }} 
      />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        <div className="flex flex-col md:flex-row items-center justify-between py-6 md:py-8 min-h-[150px]">
          
          {/* Left Content */}
          <div className="flex flex-col z-10 w-full md:w-1/2">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-500 font-medium mb-4">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/categories" className="hover:text-gray-900 dark:hover:text-white transition-colors">Categories</Link>
              <span>›</span>
              <span style={{ color: category.color }}>{category.title}</span>
            </nav>

            {/* Title & Icon */}
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                style={{ backgroundColor: `${category.color}33`, color: category.color }}
              >
                {category.icon}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-gray-900 dark:text-white">{category.title}</h1>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-6 max-w-lg leading-relaxed">
              {category.description}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-6 md:gap-8">
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{category.stats.games}</span>
                <span className="text-gray-500 text-xs font-medium">Games</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{category.stats.plays}</span>
                <span className="text-gray-500 text-xs font-medium">Plays</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{category.stats.rating}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <span className="text-gray-500 text-xs font-medium">Avg Rating</span>
              </div>
            </div>

          </div>

          {/* Right Content - 3D Graphic */}
          <div className="hidden md:flex flex-1 justify-end items-center relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center animate-[float_4s_ease-in-out_infinite]">
              {/* Concentric rings mapped to category color */}
              <div className="absolute w-[120%] h-[120%] rounded-[100%] border scale-y-50 rotate-[-15deg] opacity-10 dark:opacity-30" style={{ borderColor: category.color }} />
              <div className="absolute w-[100%] h-[100%] rounded-[100%] border scale-y-50 rotate-[-15deg] opacity-30 dark:opacity-50" style={{ borderColor: category.color }} />
              
              {/* 3D Realistic Objects (Blended perfectly) */}
              <div className="relative w-40 h-40 transform hover:scale-110 transition-transform duration-500 dark:bg-transparent bg-black rounded-full overflow-hidden shadow-2xl dark:shadow-none shadow-black/50">
                <Image 
                  src="/images/category-3d-objects.jpg" 
                  alt="Gaming 3D Objects" 
                  fill
                  className="object-contain mix-blend-screen"
                  priority
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
