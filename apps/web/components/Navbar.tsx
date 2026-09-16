'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Sun, Moon, User, ChevronDown, Gamepad2, Sparkles, Loader2, Play, Flame, Volume2, VolumeX, Trophy, Swords, Star } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';
import dynamic from 'next/dynamic';

const SpotlightSearchModal = dynamic(() => import('./SpotlightSearchModal'), { ssr: false });
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { usePlayerProgression } from '@/hooks/usePlayerProgression';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function Navbar() {
  const router = useRouter();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = useMemo(() => createClient(), []);
  const { streak, isNewStreakUnlocked, streakXpBonus, dismissStreakReward } = useDailyStreak();
  const { levelInfo, awardXp } = usePlayerProgression();
  const [isLevelPopoverOpen, setIsLevelPopoverOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isGameplayActive, setIsGameplayActive] = useState(false);
  const [isNavManuallyRestored, setIsNavManuallyRestored] = useState(false);
  const levelRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Initialize SFX mute state
  useEffect(() => {
    setIsSfxMuted(arcadeAudio.isMuted());
  }, []);

  const handleToggleSfx = () => {
    const next = arcadeAudio.toggleMute();
    setIsSfxMuted(next);
    if (!next) arcadeAudio.playBlip();
  };

  // Automatically award XP bonus when a new daily streak is unlocked
  useEffect(() => {
    if (isNewStreakUnlocked && streakXpBonus > 0) {
      awardXp(streakXpBonus, `Day ${streak} Streak Bonus`);
    }
  }, [isNewStreakUnlocked, streakXpBonus, streak, awardXp]);

  // Click-outside listener for Level popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (levelRef.current && !levelRef.current.contains(e.target as Node)) {
        setIsLevelPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset gameplay active state on navigation
  useEffect(() => {
    setIsGameplayActive(false);
    setIsNavManuallyRestored(false);
  }, [pathname]);

  // Listen for active gameplay events dispatched by GamePlayer
  useEffect(() => {
    const handleGameplayState = (e: any) => {
      if (typeof e.detail?.isPlaying === 'boolean') {
        setIsGameplayActive(e.detail.isPlaying);
        if (!e.detail.isPlaying) {
          setIsNavManuallyRestored(false);
        }
      }
    };
    window.addEventListener('spielcade:gameplay-state', handleGameplayState as EventListener);
    return () => window.removeEventListener('spielcade:gameplay-state', handleGameplayState as EventListener);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchDropdownOpen(false);
        setIsMoreOpen(false);
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
  }, [supabase]);

  const navLinks = [
    { name: 'All Games', href: '/games', icon: ChevronDown },
    { name: 'Categories', href: '/categories', icon: ChevronDown, isMega: true },
    { name: 'Tournaments', href: '/tournaments' },
    { name: 'Party', href: '/party', hideOnLg: true, icon: Swords },
    { name: 'Quests', href: '/quests', hideOnLg: true, icon: Star },
  ];

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/embed')) return null;

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 w-full max-w-[100vw] bg-white/95 dark:bg-[#0A0B1A]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 shadow-sm transition-colors">
        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3 lg:gap-5">
          
          {/* Logo */}
          <Link href="/" aria-label="Spielcade Homepage" title="Go to Spielcade Homepage" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.4)] bg-[#111228] flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Spielcade Logo" 
                width="36"
                height="36"
                className="w-[120%] h-[120%] object-cover transition-transform duration-700 group-hover:rotate-180" 
              />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
              Spiel<span className="text-indigo-600 dark:text-indigo-400">cade</span>
            </span>
          </Link>
          
          {/* Main Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const hideClass = (link as any).hideOnXl
                ? 'hidden 2xl:flex'
                : (link as any).hideOnLg
                ? 'hidden xl:flex'
                : 'flex';
              
              if (link.isMega) {
                return (
                  <div 
                    key={link.name}
                    className={`relative group h-16 items-center ${hideClass}`}
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
                  className={`relative items-center gap-1.5 h-16 text-xs xl:text-sm font-semibold transition-colors ${hideClass} ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
                    />
                  )}
                </Link>
              );
            })}

            {/* More Dropdown (Explore Playlists, Leaderboard, Blog + Party/Quests on LG) */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setIsMoreOpen(prev => !prev)}
                className={`flex items-center gap-1 h-16 text-xs xl:text-sm font-semibold transition-colors ${
                  isMoreOpen || ['/playlists', '/leaderboard', '/blog'].some(p => pathname?.startsWith(p))
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
                aria-expanded={isMoreOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 w-60 rounded-2xl bg-white dark:bg-[#12132A] border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-[60]"
                  >
                    {/* On LG viewport, Party and Quests are displayed inside More dropdown */}
                    <div className="xl:hidden border-b border-slate-100 dark:border-white/5 pb-1 mb-1">
                      <Link
                        href="/party"
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                          <Swords className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">Party Duels</span>
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">Live</span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">1v1 real-time arcade duels</p>
                        </div>
                      </Link>

                      <Link
                        href="/quests"
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">Quests & Pass</span>
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">XP</span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Daily bounties & Season 1</p>
                        </div>
                      </Link>
                    </div>

                    <Link
                      href="/for-you"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">For You</span>
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-400">AI</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Personalized discovery feed</p>
                      </div>
                    </Link>

                    <Link
                      href="/playlists"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold">Playlists</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Continuous binge play queues</p>
                      </div>
                    </Link>

                    <Link
                      href="/leaderboard"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Trophy className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold">Leaderboard</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Global top score records</p>
                      </div>
                    </Link>

                    <Link
                      href="/blog"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <Gamepad2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold">Arcade Blog</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Guides, patch notes & radar</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions (Responsive Search, Theme, Auth) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto sm:ml-0">
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
                className="flex items-center bg-slate-100 dark:bg-[#13142B] rounded-full px-3 py-1.5 w-32 lg:w-40 xl:w-48 focus-within:w-52 border border-slate-200 dark:border-white/5 focus-within:border-indigo-500 transition-all duration-300 shadow-inner"
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
                  className="bg-transparent text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
                  aria-label="Search games"
                />
                {navSearch ? (
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
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSpotlightOpen(true)}
                    className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-white/10 hover:bg-indigo-500 hover:text-white border border-gray-200 dark:border-white/10 rounded ml-1 transition-colors cursor-pointer"
                    title="Open Spotlight Search (Cmd+K / Ctrl+K)"
                  >
                    ⌘K
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

            {/* Global Player Level Badge */}
            <div className="relative hidden lg:block" ref={levelRef}>
              <button
                type="button"
                onClick={() => {
                  setIsLevelPopoverOpen(prev => !prev);
                  arcadeAudio.playBlip();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-xs font-black shrink-0 cursor-pointer select-none shadow-sm shadow-indigo-500/10 transition-all hover:scale-105 active:scale-95"
                title={`Player Level ${levelInfo.level} (${levelInfo.rankTitle}) - Click for XP progress`}
              >
                <span>{levelInfo.rankBadge}</span>
                <span>Lv.{levelInfo.level}</span>
              </button>

              {/* Level & XP Dropdown Popover */}
              <AnimatePresence>
                {isLevelPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0E1026] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-3.5 z-50 text-slate-900 dark:text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{levelInfo.rankBadge}</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {levelInfo.rankTitle}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        Lv. {levelInfo.level}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${levelInfo.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{levelInfo.xpInCurrentLevel} / {levelInfo.xpNeededForNextLevel} XP</span>
                      <span>{levelInfo.progressPercent}%</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 text-center">
                      <Link
                        href="/achievements"
                        onClick={() => setIsLevelPopoverOpen(false)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Trophy size={12} />
                        <span>View Trophy Hall & Badges →</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Daily Streak Flame Badge */}
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black shrink-0 cursor-default select-none shadow-sm shadow-amber-500/10 transition-all hover:scale-105"
              title={`Daily Streak: ${streak} Day${streak > 1 ? 's' : ''}! Play daily to multiply your XP rewards.`}
            >
              <Flame size={13} className="text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-[11px]">{streak}</span>
            </div>

            {/* Mobile Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsSpotlightOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
              title="Search Games"
              aria-label="Search Games"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Arcade Sound FX Mute Toggle */}
            <button
              onClick={handleToggleSfx}
              className="hidden sm:flex p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
              aria-label={isSfxMuted ? 'Unmute Arcade Sound FX' : 'Mute Arcade Sound FX'}
              title={isSfxMuted ? 'Unmute Arcade Sound FX' : 'Mute Arcade Sound FX'}
            >
              {isSfxMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </button>

            {/* Dark Mode */}
            <button 
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                arcadeAudio.playBlip();
              }}
              className="hidden sm:flex p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
              aria-label="Toggle Dark Mode"
              title="Toggle Dark Mode"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <Moon className="w-4 h-4" />}
            </button>
            
            {/* Sign In Button & Notifications */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
                <NotificationBell userId={user.id} />
                <UserDropdown userId={user.id} />
              </div>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Daily Streak Celebration Toast */}
      <AnimatePresence>
        {isNewStreakUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Flame size={20} className="text-yellow-300 fill-yellow-300 animate-bounce" />
            </div>
            <div className="text-left pr-2">
              <p className="text-xs font-black uppercase tracking-wider text-yellow-200">Daily Streak Active!</p>
              <p className="text-xs font-bold text-white">Day {streak} Active • +{streakXpBonus} Bonus XP</p>
            </div>
            <button
              onClick={dismissStreakReward}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-black/20 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Auto-stashed during active gameplay to reclaim 70px+ viewport) */}
      <div 
        className={`lg:hidden fixed bottom-0 inset-x-0 z-50 w-full max-w-[100vw] bg-white/95 dark:bg-[#0A0B1A]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-safe shadow-lg transition-transform duration-300 ease-in-out ${
          isGameplayActive && !isNavManuallyRestored ? 'translate-y-full pointer-events-none' : 'translate-y-0'
        }`}
      >
        <div className="flex items-center justify-around h-14 px-2">
          <Link 
            href="/" 
            title="Home" 
            className={`flex flex-col items-center justify-center w-full min-h-[44px] transition-colors ${
              pathname === '/' 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
            }`}
          >
            <Gamepad2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Home</span>
          </Link>
          <Link 
            href="/categories" 
            title="Categories" 
            className={`flex flex-col items-center justify-center w-full min-h-[44px] transition-colors ${
              pathname?.startsWith('/categories') 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Genres</span>
          </Link>
          <button 
            type="button"
            onClick={() => setIsSpotlightOpen(true)}
            title="Search Games" 
            className="flex flex-col items-center justify-center w-full min-h-[44px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Search</span>
          </button>
          <Link 
            href="/profile" 
            title="Profile" 
            className={`flex flex-col items-center justify-center w-full min-h-[44px] transition-colors ${
              pathname?.startsWith('/profile') 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </div>

      {/* Floating Restore Pill when bottom nav is stashed during gameplay */}
      {isGameplayActive && !isNavManuallyRestored && (
        <button
          type="button"
          onClick={() => setIsNavManuallyRestored(true)}
          className="lg:hidden fixed bottom-3 right-3 z-40 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-2xl backdrop-blur-md active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
          title="Show Navigation Bar"
          aria-label="Restore Navigation Bar"
        >
          <Menu className="w-3.5 h-3.5" />
          <span className="text-[10px]">Menu</span>
        </button>
      )}

      {/* Spotlight Command Center Search Modal */}
      <SpotlightSearchModal 
        isOpen={isSpotlightOpen} 
        onClose={() => setIsSpotlightOpen(false)} 
      />
    </>
  );
}
