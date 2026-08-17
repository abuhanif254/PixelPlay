'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Sun, Moon, User, ChevronDown, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    // Check active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Games', href: '/games', icon: ChevronDown },
    { name: 'Categories', href: '/categories', icon: ChevronDown, isMega: true },
    { name: 'New Games', href: '/games/new' },
    { name: 'Popular', href: '/popular' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Blog', href: '/blog' },
  ];

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-[#0A0B1A] border-b border-black/5 dark:border-white/5">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" aria-label="Spielcade Homepage" title="Go to Spielcade Homepage" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] bg-[#111228] flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Spielcade Logo" 
                className="w-[120%] h-[120%] object-cover animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite] transition-all" 
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white hidden sm:block">
              Spiel<span className="text-gray-600 dark:text-gray-300">cade</span>
            </span>
          </Link>
          
          {/* Main Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              
              if (link.isMega) {
                return (
                  <div 
                    key={link.name}
                    className="relative group h-20 flex items-center"
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <button 
                      className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      aria-expanded={isCategoriesOpen}
                      aria-haspopup="true"
                    >
                      {link.name}
                      {link.icon && <link.icon className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />}
                    </button>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6366F1]" />
                    )}

                    {/* Mega Menu Dropdown */}
                    <AnimatePresence>
                      {isCategoriesOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[400px] rounded-2xl bg-white dark:bg-[#12132A] border border-black/5 dark:border-white/5 shadow-2xl p-4 grid grid-cols-2 gap-2"
                        >
                          {['Action', 'Adventure', 'Arcade', 'Board', 'Puzzle', 'Racing', 'Sports', 'Strategy'].map((cat) => (
                            <Link 
                              key={cat} 
                              href={`/categories/${cat.toLowerCase()}-games`}
                              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-black/5 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                            >
                              {cat}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  title={`Go to ${link.name}`}
                  className={`relative flex items-center gap-1 h-20 text-sm font-semibold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
                >
                  {link.name}
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]" 
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions (Search, Theme, Auth) */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-[#13142B] rounded-full px-4 py-2 w-64 border border-black/5 dark:border-white/5 focus-within:border-[#6366F1]/50 transition-colors">
              <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search games..." 
                className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
              />
            </div>

            {/* Dark Mode */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Toggle Dark Mode"
              title="Toggle Dark Mode"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>
            
            {/* Sign In Button & Notifications */}
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell userId={user.id} />
                <Link 
                  href="/profile" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/5"
                >
                  <User className="w-4 h-4 text-primary" />
                  Profile
                </Link>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0A0B1A]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/" title="Home" className="flex flex-col items-center justify-center w-full h-full text-[#6366F1]">
            <Gamepad2 className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href="/categories" title="Categories" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Genres</span>
          </Link>
          <Link href="/search" title="Search" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Search className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Search</span>
          </Link>
          <Link href="/profile" title="Profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <User className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
}
