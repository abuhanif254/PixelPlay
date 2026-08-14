'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, SlidersHorizontal, ChevronDown, RefreshCcw, ChevronLeft, ChevronRight, LayoutGrid, List, X, Filter } from 'lucide-react';
import GameCard from '@/components/GameCard';
import GameCardSkeleton from '@/components/GameCardSkeleton';
import EmptyState from '@/components/EmptyState';
import NewsletterBanner from '@/components/NewsletterBanner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CATEGORIES = [
  { name: 'All Games', count: 523 },
  { name: 'Puzzle', count: 142 },
  { name: 'Action', count: 98 },
  { name: 'Adventure', count: 67 },
  { name: 'Racing', count: 45 },
  { name: 'Sports', count: 38 },
  { name: 'Strategy', count: 36 },
  { name: 'Arcade', count: 32 },
  { name: 'Board', count: 28 },
  { name: 'Card', count: 18 },
];

const DIFFICULTIES = ['All Levels', 'Easy', 'Medium', 'Hard', 'Expert'];
const FEATURES = ['2 Players', 'Multiplayer', 'Mobile Friendly', 'No Time Limit', 'Leaderboard', 'Achievements'];

const ITEMS_PER_PAGE = 15; // 5 columns x 3 rows on desktop

export default function AllGamesClient({ initialGames }: { initialGames: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All Games');
  const [activeDiff, setActiveDiff] = useState(searchParams.get('difficulty') || 'All Levels');
  const [activeFeatures, setActiveFeatures] = useState<string[]>(searchParams.get('features')?.split(',') || []);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  // Pagination state from URL
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Sync state changes to URL
  const updateUrl = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // When debounced search changes, update URL and reset to page 1
  useEffect(() => {
    if (debouncedSearchQuery !== searchParams.get('q')) {
       updateUrl({ q: debouncedSearchQuery || null, page: 1 });
       setCurrentPage(1);
    }
  }, [debouncedSearchQuery, updateUrl, searchParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    updateUrl({ category: cat === 'All Games' ? null : cat, page: 1 });
    if (window.innerWidth < 1024) setIsMobileFiltersOpen(false);
  };

  const handleDiffChange = (diff: string) => {
    setActiveDiff(diff);
    setCurrentPage(1);
    updateUrl({ difficulty: diff === 'All Levels' ? null : diff, page: 1 });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = activeFeatures.includes(feature) 
      ? activeFeatures.filter(f => f !== feature) 
      : [...activeFeatures, feature];
    setActiveFeatures(newFeatures);
    setCurrentPage(1);
    updateUrl({ features: newFeatures.length > 0 ? newFeatures.join(',') : null, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl({ page: page === 1 ? null : page });
    // Scroll to top of grid
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setActiveCategory('All Games');
    setActiveDiff('All Levels');
    setActiveFeatures([]);
    setSearchQuery('');
    setCurrentPage(1);
    router.push(pathname, { scroll: false });
    if (window.innerWidth < 1024) setIsMobileFiltersOpen(false);
  };

  const [displayGames, setDisplayGames] = useState<any[]>([]);
  const [totalGames, setTotalGames] = useState(0);

  // Expanded dataset for demo purposes so we can test pagination
  // In production, this would just use initialGames directly
  const extendedGamesPool = useMemo(() => {
    if (initialGames.length === 0) return [];
    if (initialGames.length > 50) return initialGames; // Already has enough data
    
    // Duplicate the initial games to create a pool of ~100 games for testing filters/pagination
    const pool = [];
    const titles = ['2048', 'Snake', 'Tic Tac Toe', 'Racing Car', 'Archer Hero', 'Bubble Shooter', 'Mineblock', 'Solitaire', 'Subway Surfers', 'Chess', 'Sudoku', 'Basketball', 'Moto X3M', 'Candy Match', '8 Ball Pool', 'Fruit Ninja', 'Tower Defense', 'Word Search', 'Flappy Bird', 'Checkers'];
    const cats = ['Puzzle', 'Arcade', 'Puzzle', 'Racing', 'Action', 'Puzzle', 'Adventure', 'Card', 'Arcade', 'Board', 'Puzzle', 'Sports', 'Racing', 'Puzzle', 'Sports', 'Arcade', 'Strategy', 'Puzzle', 'Arcade', 'Board'];
    
    for (let i = 0; i < 100; i++) {
      const base = initialGames[i % initialGames.length];
      pool.push({
        ...base,
        id: `${base.slug}-${i}`,
        title: initialGames.length === 1 ? titles[i % titles.length] : `${base.title} ${i+1}`,
        category: initialGames.length === 1 ? cats[i % cats.length] : base.category,
        mockPlays: `${Math.floor(Math.random() * 900 + 100)}K plays`,
        mockRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        isNew: i < 5 // First 5 are marked new
      });
    }
    return pool;
  }, [initialGames]);

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate network delay for loading state
    const timer = setTimeout(() => {
      // 1. Filter the entire dataset
      let filtered = extendedGamesPool.filter(game => {
        // Filter by Category
        if (activeCategory !== 'All Games' && game.category !== activeCategory) {
          return false;
        }
        
        // Filter by Search Query
        if (debouncedSearchQuery && !game.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
          return false;
        }

        // Difficulty / Features logic would go here if our schema supported it
        // For now, we'll pretend they pass

        return true;
      });

      // Update total count for pagination
      setTotalGames(filtered.length);

      // 2. Apply Pagination Slice
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedSlice = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      setDisplayGames(paginatedSlice);
      setIsLoading(false);
    }, 400); // 400ms delay to show skeletons

    return () => clearTimeout(timer);
  }, [extendedGamesPool, activeCategory, activeDiff, activeFeatures, debouncedSearchQuery, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalGames / ITEMS_PER_PAGE));

  // Generate pagination page numbers
  const generatePagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const FiltersContent = (
    <>
      <div className="hidden lg:flex items-center justify-between">
        <button className="flex items-center space-x-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-[#111228] px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 w-full shadow-sm">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Hide Filters</span>
          <span className="flex-1 text-right">✕</span>
        </button>
      </div>

      {/* Search */}
      <div>
        <h3 className="text-[13px] font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">Search Games</h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search games..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#6366F1] transition-colors"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-[13px] font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">Categories</h3>
        <ul className="space-y-1 max-h-[40vh] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <li key={cat.name}>
              <button
                onClick={() => handleCategoryChange(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all ${
                  activeCategory === cat.name 
                    ? 'bg-[#6366F1] text-white font-bold shadow-md shadow-[#6366F1]/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <span>{cat.name}</span>
                <span className={activeCategory === cat.name ? 'text-white' : 'text-gray-500 dark:text-gray-600'}>{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
        <button className="flex items-center space-x-1 text-[#6366F1] text-[13px] font-bold mt-2 px-3 hover:text-[#818cf8] transition-colors">
          <span>Show More</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Difficulty */}
      <div>
        <h3 className="text-[13px] font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">Difficulty</h3>
        <ul className="space-y-3 px-1">
          {DIFFICULTIES.map((diff) => (
            <li key={diff} className="flex items-center">
              <input 
                type="checkbox" 
                id={`diff-${diff}`} 
                checked={activeDiff === diff}
                onChange={() => handleDiffChange(diff)}
                className="w-4 h-4 rounded bg-white dark:bg-[#111228] border border-gray-300 dark:border-gray-600 accent-[#6366F1] cursor-pointer"
              />
              <label htmlFor={`diff-${diff}`} className="ml-3 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                {diff}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-[13px] font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">Features</h3>
        <ul className="space-y-3 px-1">
          {FEATURES.map((feat) => (
            <li key={feat} className="flex items-center">
              <input 
                type="checkbox" 
                id={`feat-${feat}`} 
                checked={activeFeatures.includes(feat)}
                onChange={() => toggleFeature(feat)}
                className="w-4 h-4 rounded bg-white dark:bg-[#111228] border border-gray-300 dark:border-gray-600 accent-[#6366F1] cursor-pointer"
              />
              <label htmlFor={`feat-${feat}`} className="ml-3 text-[13px] text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                {feat}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={resetFilters}
        className="w-full flex items-center justify-center space-x-2 py-3 mt-4 rounded-xl border border-[#6366F1]/30 text-[#6366F1] text-[13px] font-bold hover:bg-[#6366F1]/10 transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        <span>Reset Filters</span>
      </button>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 relative">
      
      {/* Mobile Filters Toggle */}
      <div className="lg:hidden flex items-center justify-between bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 p-4 rounded-xl">
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-bold text-gray-900 dark:text-white">{activeCategory}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600 dark:text-gray-400">{totalGames} Games</span>
        </div>
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center space-x-2 bg-[#6366F1] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-[#6366F1]/20"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile Filters Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 top-[10vh] bg-white dark:bg-[#0A0B1A] border-t border-gray-200 dark:border-white/10 z-50 rounded-t-3xl p-6 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-outfit">Filters</h2>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-7 pb-8 custom-scrollbar pr-2">
                {FiltersContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Filters */}
      <div className="hidden lg:block w-[260px] shrink-0 space-y-7 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
        {FiltersContent}
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-white/5 gap-4">
          <div className="text-lg">
            {isLoading ? (
              <div className="h-6 w-32 bg-gray-200 dark:bg-white/5 rounded animate-pulse"></div>
            ) : (
              <>
                <span className="font-bold text-[#6366F1]">{totalGames}</span> <span className="text-gray-600 dark:text-gray-300 font-medium">Games Found</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[13px] text-gray-500 dark:text-gray-400">
              <span>Sort by:</span>
              <div className="relative">
                <select className="appearance-none bg-white dark:bg-[#0A0B1A] border border-gray-300 dark:border-white/10 rounded-lg py-2 pl-3 pr-8 text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] cursor-pointer font-medium shadow-sm">
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center bg-white dark:bg-[#0A0B1A] rounded-lg p-1 border border-gray-200 dark:border-white/5 shadow-sm">
              <button className="p-1.5 rounded bg-gray-100 dark:bg-[#111228] text-[#6366F1] shadow border border-gray-200 dark:border-white/5">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        {!isLoading && displayGames.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 flex-1">
            {isLoading ? (
              Array.from({ length: 15 }).map((_, idx) => (
                <GameCardSkeleton key={idx} />
              ))
            ) : (
              displayGames.map((game) => (
                <GameCard 
                  key={game.id}
                  title={game.title}
                  category={game.category}
                  slug={game.slug}
                  plays={game.mockPlays}
                  rating={game.mockRating}
                  imageUrl={game.image}
                  isNew={game.isNew}
                />
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {(!isLoading && totalPages > 1) && (
          <div className="flex items-center justify-center space-x-1.5 mt-10 mb-6">
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`w-9 h-9 rounded-lg bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {generatePagination().map((page, idx) => (
              page === '...' ? (
                <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">...</span>
              ) : (
                <button 
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                    page === currentPage 
                      ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30' 
                      : 'bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`w-9 h-9 rounded-lg bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all ${
                currentPage === totalPages ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <NewsletterBanner />

      </div>
    </div>
  );
}
