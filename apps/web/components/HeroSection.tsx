'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Compass } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-[120px]"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-warning/20 blur-[80px]"
        />
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-fluid-3xl md:text-fluid-4xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">
            Unleash Your Next <span className="text-accent drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">Adventure</span>
          </h1>
          <p className="text-fluid-base md:text-fluid-lg text-gray-200 max-w-2xl mx-auto drop-shadow">
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
          <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-[0_0_30px_rgba(79,70,229,0.3)] bg-white dark:bg-gray-800 overflow-visible transition-shadow border border-white/10">
            <SearchBar />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Link href="/popular" className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary rounded-full">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] w-full sm:w-auto focus:outline-none"
            >
              <Play size={20} fill="currentColor" />
              Play Now
            </motion.button>
          </Link>
          <Link href="/categories" className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 rounded-full">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all shadow-lg w-full sm:w-auto focus:outline-none"
            >
              <Compass size={20} />
              Explore Games
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
