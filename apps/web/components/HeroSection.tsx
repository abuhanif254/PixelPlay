'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Compass, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const featuredGames = [
  {
    id: 1,
    title: 'Cyberpunk Racing',
    subtitle: 'The Ultimate Drift Experience',
    description: 'Race through neon-lit streets in the most visually stunning HTML5 racing game ever created. Customize your ride and dominate the global leaderboards.',
    image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2070&auto=format&fit=crop',
    rating: 4.9,
    genre: 'Racing',
    slug: 'cyberpunk-racing',
    logoText: 'CYBERPUNK',
    logoAccent: 'RACING'
  },
  {
    id: 2,
    title: 'Galactic Defense',
    subtitle: 'Protect The Outer Rim',
    description: 'Command a fleet of starships and defend humanity against waves of alien invaders in this strategic masterpiece.',
    image: 'https://images.unsplash.com/photo-1614729939124-03290b56c9ce?q=80&w=2070&auto=format&fit=crop',
    rating: 4.8,
    genre: 'Strategy',
    slug: 'galactic-defense',
    logoText: 'GALACTIC',
    logoAccent: 'DEFENSE'
  },
  {
    id: 3,
    title: 'Neon Snake',
    subtitle: 'Classic Mechanics. Modern Aesthetic.',
    description: 'The classic game reimagined with mind-bending particle effects, power-ups, and intense multiplayer arenas.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    rating: 4.7,
    genre: 'Arcade',
    slug: 'neon-snake',
    logoText: 'NEON',
    logoAccent: 'SNAKE'
  }
];

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeGame = featuredGames[currentIndex];

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] max-h-[800px] flex items-center overflow-hidden bg-black text-white">
      {/* Background Image Carousel */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={activeGame.image} 
            alt={activeGame.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      {/* Floating Particles (Framer Motion) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[120px]"
        />
        <motion.div
          animate={{ y: [0, 50, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[150px]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 h-full flex flex-col justify-center mt-12">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Meta Tags */}
              <div className="flex items-center gap-3 mb-6 text-sm font-bold tracking-widest uppercase">
                <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full backdrop-blur-md">
                  {activeGame.genre}
                </span>
                <span className="flex items-center gap-1 text-warning">
                  <Star className="w-4 h-4 fill-current" /> {activeGame.rating}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 leading-none">
                {activeGame.logoText} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{activeGame.logoAccent}</span>
              </h1>
              
              <h2 className="text-xl md:text-2xl text-gray-300 font-medium mb-6">
                {activeGame.subtitle}
              </h2>

              <p className="text-base md:text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
                {activeGame.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/games/${activeGame.slug}`} className="focus:outline-none">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-full hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all w-full sm:w-auto text-lg group"
                  >
                    <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                    Play Now
                  </motion.button>
                </Link>
                <Link href="/categories" className="focus:outline-none">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all w-full sm:w-auto text-lg"
                  >
                    <Compass className="w-6 h-6" />
                    Explore All
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Thumbnails */}
      <div className="absolute bottom-8 right-4 md:right-8 z-20 flex gap-3">
        {featuredGames.map((game, idx) => (
          <button
            key={game.id}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
              currentIndex === idx 
                ? 'border-primary shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-110 z-10' 
                : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
            }`}
          >
            <Image 
              src={game.image} 
              alt={game.title}
              fill
              className="object-cover"
            />
            {currentIndex === idx && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-current opacity-80" />
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
};
