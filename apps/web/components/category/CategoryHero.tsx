import React from 'react';
import Link from 'next/link';
import { CategoryData } from '@/lib/mockCategories';

export default function CategoryHero({ category }: { category: CategoryData }) {
  return (
    <div className="w-full bg-[#05050F] relative overflow-hidden border-b border-white/5 mb-8">
      {/* Background Glows */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[400px] blur-[120px] rounded-full pointer-events-none opacity-20"
        style={{ backgroundColor: category.color }} 
      />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-16 min-h-[300px]">
          
          {/* Left Content */}
          <div className="flex flex-col z-10 w-full md:w-1/2">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
              <span>›</span>
              <span style={{ color: category.color }}>{category.title}</span>
            </nav>

            {/* Title & Icon */}
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                style={{ backgroundColor: `${category.color}33`, color: category.color }} // 33 is 20% opacity hex
              >
                {category.icon}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-white">{category.title}</h1>
            </div>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              {category.description}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-8 md:gap-12">
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">{category.stats.games}</span>
                <span className="text-gray-500 text-sm font-medium">Games</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">{category.stats.plays}</span>
                <span className="text-gray-500 text-sm font-medium">Plays</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl md:text-3xl font-black text-white">{category.stats.rating}</span>
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <span className="text-gray-500 text-sm font-medium">Avg Rating</span>
              </div>
            </div>

          </div>

          {/* Right Content - 3D Graphic Placeholder */}
          <div className="hidden md:flex flex-1 justify-end items-center relative z-10">
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Concentric rings mapped to category color */}
              <div className="absolute w-[120%] h-[120%] rounded-[100%] border scale-y-50 rotate-[-15deg] opacity-30" style={{ borderColor: category.color }} />
              <div className="absolute w-[100%] h-[100%] rounded-[100%] border scale-y-50 rotate-[-15deg] opacity-50" style={{ borderColor: category.color }} />
              <div className="absolute w-[80%] h-[80%] rounded-[100%] border scale-y-50 rotate-[-15deg]" style={{ borderColor: category.color }} />
              
              <div className="relative w-40 h-40 transform rotate-12 hover:rotate-0 transition-all duration-700">
                <div 
                  className="absolute inset-0 rounded-xl flex items-center justify-center overflow-hidden shadow-2xl"
                  style={{ background: `linear-gradient(to top right, #111228, ${category.color})`, boxShadow: `0 0 50px ${category.color}80` }}
                >
                  <div className="grid grid-cols-3 grid-rows-3 w-[85%] h-[85%] gap-1">
                    {[...Array(9)].map((_, i) => {
                      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-purple-500'];
                      const randColor = colors[i % colors.length];
                      return <div key={i} className={`rounded-sm ${randColor}`} />
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
