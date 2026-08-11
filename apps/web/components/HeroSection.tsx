'use client';

import React from 'react';
import { Search, Zap, Gamepad2, Users, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-[700px] pt-32 pb-20 bg-gray-50 dark:bg-[#0A0B1A] text-gray-900 dark:text-white overflow-hidden">
      
      {/* Star Particles Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
        <div className="absolute top-20 left-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_white]" />
        <div className="absolute top-40 left-[40%] w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_12px_2px_#93c5fd]" />
        <div className="absolute top-80 left-[5%] w-1 h-1 bg-white rounded-full shadow-[0_0_8px_1px_white]" />
        <div className="absolute top-32 right-[20%] w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_15px_3px_#fde047]" />
        <div className="absolute top-60 right-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_white]" />
        <div className="absolute bottom-20 right-[30%] w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_12px_2px_#c084fc]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-start">
            {/* Trust Badge */}
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full mb-8">
              <Zap className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-yellow-500 text-xs font-bold tracking-wide">
                100% Free • No Downloads • Instant Play
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Play Amazing <br />
              <span className="text-[#8B5CF6]">Games</span> Online
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
              Discover thousands of free browser games. No downloads, no installs – just click and play instantly!
            </p>

            {/* Hero Search Bar */}
            <div className="w-full max-w-xl relative flex items-center bg-white dark:bg-[#13142B] border border-black/5 dark:border-white/5 rounded-full p-2 mb-6 focus-within:border-[#6366F1]/50 transition-colors shadow-2xl">
              <div className="pl-4 pr-2">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="text" 
                placeholder="Search games..." 
                className="bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-full focus:outline-none text-lg py-3"
              />
              <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold py-3 px-8 rounded-full transition-colors shrink-0">
                Search
              </button>
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <span className="text-gray-500 text-sm font-medium">Popular Searches:</span>
              {['Snake', '2048', 'Minecraft', 'Car Games', 'Puzzle'].map(tag => (
                <Link 
                  key={tag} 
                  href={`/search?q=${tag.toLowerCase()}`}
                  className="px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Gamepad2 className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">1000+</div>
                  <div className="text-sm text-gray-500 font-medium">Games</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">500K+</div>
                  <div className="text-sm text-gray-500 font-medium">Players</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">4.8/5</div>
                  <div className="text-sm text-gray-500 font-medium">User Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visuals */}
          <div className="relative w-full h-[600px] hidden lg:flex items-center justify-center">
            {/* Glowing Rings Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[400px] h-[400px] rounded-full border border-purple-500/20 shadow-[0_0_100px_30px_rgba(139,92,246,0.15)] animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[550px] h-[550px] rounded-full border border-blue-500/10 shadow-[0_0_100px_30px_rgba(59,130,246,0.1)] animate-[spin_30s_linear_infinite_reverse]" />
            </div>
            
            {/* 3D Generated Controller Image */}
            <div className="relative w-[120%] h-[120%] z-10 -mr-20">
              <Image 
                src="/hero_controller.jpg" 
                alt="3D Gaming Controller"
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]"
                priority
              />
              {/* Overlay gradient to blend edges if the generated image isn't perfectly transparent */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_100px_100px_#f9fafb] dark:shadow-[inset_0_0_100px_100px_#0A0B1A]" style={{mixBlendMode: 'multiply'}} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
