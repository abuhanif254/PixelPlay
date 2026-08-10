'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Compass } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-primary text-black dark:text-white">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-black dark:text-white">
            Unleash Your Next <span className="text-accent">Adventure</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover thousands of free browser games. No downloads, no waiting. Just play directly in your browser.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-xl relative"
        >
          <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
            <div className="grid place-items-center h-full w-12 text-gray-500 dark:text-gray-400">
              <Search size={20} />
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-gray-900 dark:text-white pr-4 bg-transparent"
              type="text"
              id="search"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="h-full px-6 bg-accent text-black dark:text-white font-semibold transition-colors hover:bg-accent/90">
              Search
            </button>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-warning text-primary font-bold rounded-full hover:bg-warning/90 transition-all transform hover:scale-105 shadow-lg">
            <Play size={20} fill="currentColor" />
            Play Now
          </button>
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-black dark:text-white font-bold rounded-full hover:bg-black/20 dark:bg-white/20 transition-all transform hover:scale-105">
            <Compass size={20} />
            Explore Games
          </button>
        </motion.div>
      </div>
    </section>
  );
};
