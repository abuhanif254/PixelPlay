'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Sun, Moon, User, ChevronDown, Gamepad2, Sparkles, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';

export default function Navbar() {
  const router = useRouter();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (navSearch.trim().length < 2) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(navSearch.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.games || []);
          setIsSearchDropdownOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [navSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-[#0A0B1A]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 lg:gap-6">
          
          {/* Logo */}
          <Link href="/" aria-label="Spielcade Homepage" title="Go to Spielcade Homepage" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.4)] bg-[#111228] flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Spielcade Logo" 
                className="w-[120%] h-[120%] object-cover animate-[spin_12s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite] transition-all" 
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Spiel<span className="text-indigo-600 dark:text-indigo-400">cade</span>
            </span>
          </Link>
          
          {/* Main Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              
              if (link.isMega) {
                return (
                  <div 
                    key={link.name}
                    className="relative group h-16 flex items-center"
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <button 
                      className="flex items-center gap-1 text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                      aria-expanded={isCategoriesOpen}
                      aria-haspopup="true"
                    >
                      {link.name}
                      {link.icon && <link.icon className={`w-3.5 h-3.5 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />}
                    </button>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />
                    )}

                    {/* Mega Menu Dropdown */}
                    <AnimatePresence>
                      {isCategoriesOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 w-[540px] rounded-2xl bg-white dark:bg-[#12132A] border border-slate-200 dark:border-white/10 shadow-2xl p-5"
                        >
                          <div className="grid grid-cols-2 gap-5">
                            {/* Column 1: Core Genres */}
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 px-2">
                                Core Genres
                              </span>
                              <div className="flex flex-col gap-0.5">
                                {[
                                  { name: 'Action Games', slug: 'action-games', icon: '⚔️' },
                                  { name: 'Racing Games', slug: 'racing-games', icon: '🏎️' },
                                  { name: 'Puzzle Games', slug: 'puzzle-games', icon: '🧩' },
                                  { name: 'Arcade Games', slug: 'arcade-games', icon: '👾' },
                                  { name: 'Adventure Games', slug: 'adventure-games', icon: '🗺️' },
                                  { name: 'Strategy Games', slug: 'strategy-games', icon: '♟️' },
                                  { name: 'Sports Games', slug: 'sports-games', icon: '🏅' },
                                  { name: 'Board Games', slug: 'board-games', icon: '🎲' },
                                ].map((cat) => (
                                  <Link 
                                    key={cat.slug} 
                                    href={`/categories/${cat.slug}`}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                                  >
                                    <span className="text-xs">{cat.icon}</span>
                                    {cat.name}
                                  </Link>
                                ))}
                              </div>
                            </div>

                            {/* Column 2: Thematic Clusters */}
                            <div>
                              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2 px-2">
                                Trending Clusters
                              </span>
                              <div className="flex flex-col gap-0.5">
                                {[
                                  { name: 'Car Games', slug: 'car-games', icon: '🚗' },
                                  { name: 'Zombie Games', slug: 'zombie-games', icon: '🧟' },
                                  { name: '2 Player Games', slug: '2-player-games', icon: '👥' },
                                  { name: 'Stickman Games', slug: 'stickman-games', icon: '🏃' },
                                  { name: 'Shooting Games', slug: 'shooting-games', icon: '🎯' },
                                  { name: 'Unblocked Games', slug: 'unblocked-games', icon: '🔓' },
                                  { name: 'Runner Games', slug: 'runner-games', icon: '🏃‍♂️' },
                                  { name: 'Escape Games', slug: 'escape-games', icon: '🗝️' },
                                ].map((cluster) => (
                                  <Link 
                                    key={cluster.slug} 
                                    href={`/categories/${cluster.slug}`}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-400 transition-colors"
                                  >
                                    <span className="text-xs">{cluster.icon}</span>
                                    {cluster.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Footer bar */}
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between px-2">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">17,000+ instant HTML5 browser games</span>
                            <Link 
                              href="/categories" 
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
                            >
                              Explore All Genres →
                            </Link>
                          </div>
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
                  className={`relative flex items-center gap-1 h-16 text-xs xl:text-sm font-semibold transition-colors ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
                >
                  {link.name}
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions (Responsive Search, Theme, Auth) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Responsive Search Bar with Live Predictive Dropdown */}
            <div ref={searchRef} className="relative hidden md:block">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (navSearch.trim()) {
                    setIsSearchDropdownOpen(false);
                    router.push(`/games?search=${encodeURIComponent(navSearch.trim())}`);
                  }
                }}
                className="flex items-center bg-slate-100 dark:bg-[#13142B] rounded-full px-3.5 py-1.5 w-44 lg:w-56 focus-within:w-72 border border-slate-200 dark:border-white/5 focus-within:border-indigo-500 transition-all duration-300 shadow-inner"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin mr-2 shrink-0" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                )}
                <input 
                  type="text" 
                  value={navSearch}
                  onChange={(e) => {
                    setNavSearch(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setIsSearchDropdownOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0 && navSearch.trim().length >= 2) {
                      setIsSearchDropdownOpen(true);
                    }
                  }}
                  placeholder="Search 17,000+ games..." 
                  className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
                  aria-label="Search games"
                />
                {navSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavSearch('');
                      setSearchResults([]);
                      setIsSearchDropdownOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>

              {/* Floating Live Search Results */}
              <AnimatePresence>
                {isSearchDropdownOpen && navSearch.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-white/95 dark:bg-[#0E0F24]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 z-[60] overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-white/5 mb-1.5">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {isSearching ? 'Searching...' : `Matching Games (${searchResults.length})`}
                      </span>
                      <span className="text-[10px] text-slate-400">Esc to close</span>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="flex flex-col gap-1 max-h-[340px] overflow-y-auto custom-scrollbar">
                        {searchResults.map((game: any) => (
                          <Link
                            key={game.slug}
                            href={`/games/${game.slug}`}
                            onClick={() => {
                              setIsSearchDropdownOpen(false);
                              setNavSearch('');
                            }}
                            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-white/5 transition-all"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-black/40 shrink-0 border border-slate-200 dark:border-white/5">
                              {game.image_url ? (
                                <img 
                                  src={game.image_url} 
                                  alt={game.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                  loading="lazy" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-slate-400">
                                  {game.title?.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {game.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {game.category}
                                </span>
                                <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                                  ★ {Number(game.rating || 4.8).toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white rounded-lg p-1.5 shrink-0 shadow-sm shadow-indigo-600/30">
                              <Play className="w-3 h-3 fill-current" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      !isSearching && (
                        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          No games found matching &quot;{navSearch}&quot;
                        </div>
                      )
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                      <Link
                        href={`/games?search=${encodeURIComponent(navSearch.trim())}`}
                        onClick={() => {
                          setIsSearchDropdownOpen(false);
                          setNavSearch('');
                        }}
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                      >
                        View all results for &quot;{navSearch}&quot; →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Dark Mode"
              title="Toggle Dark Mode"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <div className="w-4 h-4" />}
            </button>
            
            {/* Sign In Button & Notifications */}
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell userId={user.id} />
                <UserDropdown userId={user.id} />
              </div>
            ) : (
              <Link 
                href="/login" 
                className="hidden sm:flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0A0B1A]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-safe shadow-lg">
        <div className="flex items-center justify-around h-14 px-2">
          <Link href="/" title="Home" className="flex flex-col items-center justify-center w-full h-full text-indigo-600 dark:text-indigo-400">
            <Gamepad2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href="/categories" title="Categories" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Genres</span>
          </Link>
          <Link href="/games" title="Search" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Search className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Search</span>
          </Link>
          <Link href="/profile" title="Profile" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
}
