import React from 'react';
import Link from 'next/link';

export default function CategoryHero() {
  return (
    <div className="w-full bg-[#05050F] relative overflow-hidden border-b border-white/5 mb-8">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-[#6366F1]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-16 min-h-[300px]">
          
          {/* Left Content */}
          <div className="flex flex-col z-10 w-full md:w-1/2">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium mb-6">
              <Link href="/" className="hover:text-[#6366F1] transition-colors">Home</Link>
              <span>›</span>
              <Link href="/categories" className="hover:text-[#6366F1] transition-colors">Categories</Link>
              <span>›</span>
              <span className="text-[#6366F1]">Puzzle Games</span>
            </nav>

            {/* Title & Icon */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center shrink-0">
                {/* Puzzle piece icon */}
                <svg className="w-7 h-7 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 11h-2V9c0-1.1-.9-2-2-2h-2V5.5C14.5 3.57 12.93 2 11 2S7.5 3.57 7.5 5.5V7h-2c-1.1 0-2 .9-2 2v2H1.5C.67 11 0 11.67 0 12.5S.67 14 1.5 14H3v2c0 1.1.9 2 2 2h2v1.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5V20h2c1.1 0 2-.9 2-2v-2h2c.83 0 1.5-.67 1.5-1.5S21.33 11 20.5 11zM14 18h-2v1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V18H7v-2H5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5H7V9h2V7.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V9h2v2h1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H14v2z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-white">Puzzle Games</h1>
            </div>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              Challenge your mind with our collection of the best puzzle games. Solve, match, connect, and win!
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-8 md:gap-12">
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">125+</span>
                <span className="text-gray-500 text-sm font-medium">Games</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">2.3M+</span>
                <span className="text-gray-500 text-sm font-medium">Plays</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl md:text-3xl font-black text-white">4.6</span>
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <span className="text-gray-500 text-sm font-medium">Avg Rating</span>
              </div>
            </div>

          </div>

          {/* Right Content - 3D Graphic Placeholder */}
          <div className="hidden md:flex flex-1 justify-end items-center relative z-10">
            {/* Recreating the Rubik's cube vibe with basic shapes and glow */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Concentric rings */}
              <div className="absolute w-[120%] h-[120%] rounded-[100%] border border-[#6366F1]/20 scale-y-50 rotate-[-15deg] opacity-50" />
              <div className="absolute w-[100%] h-[100%] rounded-[100%] border border-[#6366F1]/30 scale-y-50 rotate-[-15deg] opacity-70" />
              <div className="absolute w-[80%] h-[80%] rounded-[100%] border border-[#6366F1]/50 scale-y-50 rotate-[-15deg]" />
              
              {/* The "Cube" */}
              <div className="relative w-40 h-40 transform rotate-12 hover:rotate-0 transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-[#6366F1] to-blue-400 rounded-xl shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 grid-rows-3 w-[85%] h-[85%] gap-1">
                    {[...Array(9)].map((_, i) => {
                      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-purple-500'];
                      const randColor = colors[i % colors.length];
                      return <div key={i} className={`rounded-sm ${randColor}`} />
                    })}
                  </div>
                </div>
              </div>

              {/* Floating shapes */}
              <div className="absolute top-4 right-10 w-10 h-10 bg-purple-500/80 backdrop-blur-sm rounded-lg rotate-45 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse" />
              <div className="absolute bottom-10 right-0 w-12 h-12 bg-orange-500/80 backdrop-blur-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-bounce text-white flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-blue-500/80 backdrop-blur-sm rounded shadow-[0_0_20px_rgba(59,130,246,0.4)] -rotate-12 animate-pulse" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
