'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Sun, Moon, User, ChevronDown, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { SearchBar } from './SearchBar';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight hidden sm:block">PixelPlay</span>
        </Link>
        {/* Search */}
        <div className="flex-1 max-w-xl hidden md:flex items-center">
          <SearchBar />
        </div>
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <div 
            className="relative"
            onMouseEnter={() => setIsCategoriesOpen(true)}
            onMouseLeave={() => setIsCategoriesOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Categories <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {isCategoriesOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-background border border-black/10 dark:border-white/10 shadow-xl overflow-hidden py-2"
                >
                  {['Action', 'Puzzle', 'Strategy', 'RPG', 'Sports'].map(cat => (
                    <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="block px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                      {cat}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/new" className="text-sm font-medium hover:text-accent transition-colors">New Games</Link>
          <Link href="/popular" className="text-sm font-medium hover:text-warning transition-colors">Popular</Link>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <User className="w-5 h-5" />
          </button>
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-black/10 dark:border-white/10 bg-background overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              <div className="relative z-50">
                <SearchBar />
              </div>
              <Link href="/categories" className="py-2 text-sm font-medium border-b border-black/5 dark:border-white/5">Categories</Link>
              <Link href="/new" className="py-2 text-sm font-medium border-b border-black/5 dark:border-white/5 text-accent">New Games</Link>
              <Link href="/popular" className="py-2 text-sm font-medium text-warning">Popular</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
