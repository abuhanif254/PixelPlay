'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Sun, Moon, User, ChevronDown, Gamepad2, Bell, Zap, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { SearchBar } from './SearchBar';

export default function Navbar() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          hasScrolled 
            ? 'bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className={`font-extrabold text-2xl tracking-tight hidden sm:block ${hasScrolled ? 'text-foreground' : 'text-white'}`}>
              PixelPlay
            </span>
          </Link>
          
          {/* Main Navigation (Desktop) */}
          <div className={`hidden md:flex items-center gap-1 bg-background/40 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 ${!hasScrolled && 'bg-white/10 text-white'}`}>
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                Categories <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mega Menu */}
              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[700px] rounded-3xl bg-background/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden p-6 grid grid-cols-3 gap-6 text-foreground"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-warning" /> Popular</h4>
                      <div className="flex flex-col gap-1">
                        <Link href="/category/action" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                          Action <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                        <Link href="/category/puzzle" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                          Puzzle <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                        <Link href="/category/strategy" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                          Strategy <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" /> Multiplayer</h4>
                      <div className="flex flex-col gap-1">
                        <Link href="/category/io" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                          .io Games <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                        <Link href="/category/sports" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                          Sports <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                        <Link href="/category/racing" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                          Racing <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                      </div>
                    </div>
                    <Link href="/categories" className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-primary/20 hover:border-primary/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-base font-bold text-primary">Discover All</span>
                      <p className="text-xs text-gray-500 mt-1">Browse 10,000+ free games</p>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/new" className="text-sm font-semibold hover:text-accent transition-colors px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">New Releases</Link>
            <Link href="/popular" className="text-sm font-semibold hover:text-warning transition-colors px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">Top Rated</Link>
          </div>

          {/* Search, Notifications, Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search (Desktop & Tablet) */}
            <div className="hidden lg:block w-64">
              <SearchBar />
            </div>

            {/* Notifications */}
            <button className={`relative p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${!hasScrolled && 'text-white'}`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger border-2 border-background"></span>
            </button>

            {/* Dark Mode */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${!hasScrolled && 'text-white'}`}
              aria-label="Toggle Dark Mode"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>
            
            {/* Gamer Profile Badge (Login) */}
            <Link href="/login" className="hidden sm:flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-background/40 backdrop-blur-md border border-white/10 hover:bg-primary/10 transition-all group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className={`flex flex-col ${!hasScrolled && 'text-white'}`}>
                <span className="text-xs font-bold leading-none">Login</span>
                <span className="text-[10px] text-primary font-bold">Lvl. 1</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Kept mostly as is but polished) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-black/10 dark:border-white/10 pb-safe">
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
