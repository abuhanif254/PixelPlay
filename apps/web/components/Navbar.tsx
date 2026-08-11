'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Sun, Moon, User, ChevronDown, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { SearchBar } from './SearchBar';

export default function Navbar() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl tracking-tight hidden sm:block">PixelPlay</span>
          </Link>
          
          {/* Search (Desktop & Tablet) */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center mx-4">
            <SearchBar />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors py-5">
                Categories <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mega Menu */}
              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[600px] rounded-2xl bg-background border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden p-6 grid grid-cols-3 gap-6 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:bg-transparent"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Popular</h4>
                      <div className="flex flex-col gap-2">
                        <Link href="/category/action" className="text-sm font-medium hover:text-primary transition-colors">Action</Link>
                        <Link href="/category/puzzle" className="text-sm font-medium hover:text-primary transition-colors">Puzzle</Link>
                        <Link href="/category/strategy" className="text-sm font-medium hover:text-primary transition-colors">Strategy</Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Multiplayer</h4>
                      <div className="flex flex-col gap-2">
                        <Link href="/category/io" className="text-sm font-medium hover:text-primary transition-colors">.io Games</Link>
                        <Link href="/category/sports" className="text-sm font-medium hover:text-primary transition-colors">Sports</Link>
                        <Link href="/category/racing" className="text-sm font-medium hover:text-primary transition-colors">Racing</Link>
                      </div>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-primary/10">
                      <Gamepad2 className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm font-bold">Discover All</span>
                      <p className="text-xs text-gray-500 mt-1">Browse 10,000+ free games</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/new" className="text-sm font-semibold hover:text-accent transition-colors">New Games</Link>
            <Link href="/popular" className="text-sm font-semibold hover:text-warning transition-colors">Popular</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm">
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-black/10 dark:border-white/10 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-primary">
            <Gamepad2 className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href="/categories" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary transition-colors">
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Genres</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary transition-colors">
            <Search className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary transition-colors">
            <User className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
}
