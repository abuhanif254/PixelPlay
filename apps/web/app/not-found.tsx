import React from 'react';
import Link from 'next/link';
import { Home, Search, Gamepad2, Compass } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Spielcade',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] flex items-center justify-center pt-20 pb-12 px-4 relative overflow-hidden transition-colors">
      
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6366F1]/20 rounded-full blur-[120px] pointer-events-none opacity-50 dark:opacity-30" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#10B981]/20 rounded-full blur-[100px] pointer-events-none opacity-50 dark:opacity-20 mix-blend-screen" />

      <div className="max-w-2xl w-full text-center relative z-10">
        
        {/* Animated Glitch Text (404) */}
        <div className="relative mb-8 select-none">
          <h1 className="text-8xl md:text-[150px] font-black font-outfit text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-600 tracking-tighter">
            404
          </h1>
          {/* Subtle decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-4 bg-gray-900/10 dark:bg-white/10 blur-sm rotate-3" />
        </div>

        {/* Messaging */}
        <h2 className="text-2xl md:text-3xl font-bold font-outfit text-gray-900 dark:text-white mb-4">
          Oops! Game Over
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-10 max-w-lg mx-auto">
          The level you're looking for doesn't exist, was moved, or maybe you took a wrong turn at Albuquerque.
        </p>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#6366F1] hover:bg-[#5457DF] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] group"
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            <span>Return Home</span>
          </Link>
          
          <Link 
            href="/games" 
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-[#111228] hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-xl transition-all shadow-sm group"
          >
            <Gamepad2 size={20} className="text-[#6366F1] group-hover:rotate-12 transition-transform" />
            <span>Browse Games</span>
          </Link>

          <Link 
            href="/categories" 
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-[#111228] hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-xl transition-all shadow-sm group"
          >
            <Compass size={20} className="text-[#10B981] group-hover:scale-110 transition-transform" />
            <span>Categories</span>
          </Link>

          <Link 
            href="/search" 
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-[#111228] hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-xl transition-all shadow-sm group"
          >
            <Search size={20} className="text-[#F59E0B] group-hover:scale-110 transition-transform" />
            <span>Search</span>
          </Link>

        </div>

      </div>
    </div>
  );
}
