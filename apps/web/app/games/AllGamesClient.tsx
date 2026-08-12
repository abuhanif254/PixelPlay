'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronDown, RefreshCcw, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import GameCard from '@/components/GameCard';
import NewsletterBanner from '@/components/NewsletterBanner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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

export default function AllGamesClient({ initialGames }: { initialGames: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All Games');
  const [activeDiff, setActiveDiff] = useState(searchParams.get('difficulty') || 'All Levels');
  const [activeFeatures, setActiveFeatures] = useState<string[]>(searchParams.get('features')?.split(',') || []);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Sync state changes to URL
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // When debounced search changes, update URL
  useEffect(() => {
    updateUrl({ q: debouncedSearchQuery || null });
  }, [debouncedSearchQuery, updateUrl]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    updateUrl({ category: cat === 'All Games' ? null : cat });
  };

  const handleDiffChange = (diff: string) => {
    setActiveDiff(diff);
    updateUrl({ difficulty: diff === 'All Levels' ? null : diff });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = activeFeatures.includes(feature) 
      ? activeFeatures.filter(f => f !== feature) 
      : [...activeFeatures, feature];
    setActiveFeatures(newFeatures);
    updateUrl({ features: newFeatures.length > 0 ? newFeatures.join(',') : null });
  };

  const resetFilters = () => {
    setActiveCategory('All Games');
    setActiveDiff('All Levels');
    setActiveFeatures([]);
    setSearchQuery('');
    router.push(pathname, { scroll: false }); // Clear all query params
  };

  const [displayGames, setDisplayGames] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this is where we would filter `initialGames` based on activeCategory, searchQuery, etc.
    const mocked = Array.from({ length: 15 }).map((_, i) => {
      const baseGame = initialGames[i % initialGames.length] || { title: 'Unknown', category: 'Arcade', slug: '#' };
      
      const playsNum = Math.floor(Math.random() * 900) + 100;
      const playsStr = Math.random() > 0.5 ? `${(playsNum / 10).toFixed(1)}M plays` : `${playsNum}K plays`;
      const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

      let mockTitle = baseGame.title;
      let mockCategory = baseGame.category;
      if (initialGames.length === 1) {
         const titles = ['2048', 'Snake', 'Tic Tac Toe', 'Racing Car', 'Archer Hero', 'Bubble Shooter', 'Mineblock', 'Solitaire', 'Subway Surfers', 'Chess', 'Sudoku', 'Basketball', 'Moto X3M', 'Candy Match', '8 Ball Pool'];
         const cats = ['Puzzle', 'Arcade', 'Puzzle', 'Racing', 'Action', 'Puzzle', 'Adventure', 'Card', 'Arcade', 'Board', 'Puzzle', 'Sports', 'Racing', 'Puzzle', 'Sports'];
         mockTitle = titles[i];
         mockCategory = cats[i];
      }

      return {
        ...baseGame,
        title: mockTitle,
        category: mockCategory,
        mockPlays: playsStr,
        mockRating: parseFloat(rating),
        id: i,
        isNew: i === 0
      };
    });
    setDisplayGames(mocked);
  }, [initialGames, activeCategory, activeDiff, activeFeatures, debouncedSearchQuery]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
      
      {/* Left Sidebar Filters */}
      <div className="w-full lg:w-[260px] shrink-0 space-y-7">
        
        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 text-sm font-bold text-gray-300 hover:text-white transition-colors bg-[#111228] px-4 py-2.5 rounded-xl border border-white/5 w-full shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Hide Filters</span>
            <span className="flex-1 text-right">✕</span>
          </button>
        </div>

        {/* Search */}
        <div>
          <h3 className="text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Search Games</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111228] border border-white/5 rounded-xl py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-[#6366F1] transition-colors"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Categories</h3>
          <ul className="space-y-1">
            {CATEGORIES.map((cat) => (
              <li key={cat.name}>
                <button
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all ${
                    activeCategory === cat.name 
                      ? 'bg-[#6366F1] text-white font-bold shadow-md shadow-[#6366F1]/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={activeCategory === cat.name ? 'text-white' : 'text-gray-600'}>{cat.count}</span>
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
          <h3 className="text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Difficulty</h3>
          <ul className="space-y-3 px-1">
            {DIFFICULTIES.map((diff) => (
              <li key={diff} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`diff-${diff}`} 
                  checked={activeDiff === diff}
                  onChange={() => handleDiffChange(diff)}
                  className="w-4 h-4 rounded bg-[#111228] border border-gray-600 accent-[#6366F1] cursor-pointer"
                />
                <label htmlFor={`diff-${diff}`} className="ml-3 text-[13px] text-gray-300 cursor-pointer hover:text-white">
                  {diff}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Features</h3>
          <ul className="space-y-3 px-1">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`feat-${feat}`} 
                  checked={activeFeatures.includes(feat)}
                  onChange={() => toggleFeature(feat)}
                  className="w-4 h-4 rounded bg-[#111228] border border-gray-600 accent-[#6366F1] cursor-pointer"
                />
                <label htmlFor={`feat-${feat}`} className="ml-3 text-[13px] text-gray-300 cursor-pointer hover:text-white">
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

      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-white/5 gap-4">
          <div className="text-lg">
            <span className="font-bold text-[#6366F1]">523</span> <span className="text-gray-300 font-medium">Games Found</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[13px] text-gray-400">
              <span>Sort by:</span>
              <div className="relative">
                <select className="appearance-none bg-[#0A0B1A] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-white focus:outline-none focus:border-[#6366F1] cursor-pointer font-medium shadow-sm">
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center bg-[#0A0B1A] rounded-lg p-1 border border-white/5 shadow-sm">
              <button className="p-1.5 rounded bg-[#111228] text-[#6366F1] shadow border border-white/5">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded text-gray-500 hover:text-white transition-colors">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Grid - EXACTLY 5 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 flex-1">
          {displayGames.map((game) => (
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
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-1.5 mt-10 mb-6">
          <button className="w-9 h-9 rounded-lg bg-[#111228] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {[1, 2, 3, 4, 5].map(page => (
            <button 
              key={page}
              className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                page === 1 
                  ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30' 
                  : 'bg-[#111228] border border-white/5 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {page}
            </button>
          ))}
          
          <span className="w-9 h-9 flex items-center justify-center text-gray-500 text-sm">...</span>
          
          <button className="w-9 h-9 rounded-lg bg-[#111228] border border-white/5 text-sm font-bold flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
            11
          </button>
          
          <button className="w-9 h-9 rounded-lg bg-[#111228] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <NewsletterBanner />

      </div>
    </div>
  );
}
