'use client';

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, RefreshCcw, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import GameCard from '@/components/GameCard';
import NewsletterBanner from '@/components/NewsletterBanner';

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
  const [activeCategory, setActiveCategory] = useState('All Games');
  const [activeDiff, setActiveDiff] = useState('All Levels');
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate random plays and ratings for the UI demo since we don't have real backend data yet
  const [displayGames, setDisplayGames] = useState<any[]>([]);

  useEffect(() => {
    // Duplicate the initial games to create a grid of 12 items for the UI mockup
    const mocked = Array.from({ length: 12 }).map((_, i) => {
      const baseGame = initialGames[i % initialGames.length] || { title: 'Unknown', category: 'Arcade', slug: '#' };
      
      // Randomize based on index to keep it stable during render but varied
      const playsNum = Math.floor(Math.random() * 900) + 100;
      const playsStr = Math.random() > 0.5 ? `${(playsNum / 10).toFixed(1)}M plays` : `${playsNum}K plays`;
      const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0

      // Add variety to the titles for the mockup if we only have one game
      let mockTitle = baseGame.title;
      let mockCategory = baseGame.category;
      if (initialGames.length === 1) {
         const titles = ['2048', 'Snake', 'Tic Tac Toe', 'Racing Car', 'Archer Hero', 'Bubble Shooter', 'Mineblock', 'Solitaire', 'Subway Surfers', 'Chess', 'Sudoku', 'Basketball'];
         const cats = ['Puzzle', 'Arcade', 'Puzzle', 'Racing', 'Action', 'Puzzle', 'Adventure', 'Card', 'Arcade', 'Board', 'Puzzle', 'Sports'];
         mockTitle = titles[i % titles.length];
         mockCategory = cats[i % cats.length];
      }

      return {
        ...baseGame,
        title: mockTitle,
        category: mockCategory,
        mockPlays: playsStr,
        mockRating: parseFloat(rating),
        id: i
      };
    });
    setDisplayGames(mocked);
  }, [initialGames]);

  const toggleFeature = (feature: string) => {
    setActiveFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const resetFilters = () => {
    setActiveCategory('All Games');
    setActiveDiff('All Levels');
    setActiveFeatures([]);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Left Sidebar Filters */}
      <div className="w-full lg:w-64 shrink-0 space-y-8">
        
        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 text-sm font-bold text-gray-300 hover:text-white transition-colors bg-[#111228] px-4 py-2 rounded-xl border border-white/5 w-full">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Hide Filters</span>
            <span className="flex-1 text-right">✕</span>
          </button>
        </div>

        {/* Search */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Search Games</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111228] border border-white/5 rounded-xl py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-[#6366F1] transition-colors"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Categories</h3>
          <ul className="space-y-1">
            {CATEGORIES.map((cat) => (
              <li key={cat.name}>
                <button
                  onClick={() => setActiveCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeCategory === cat.name 
                      ? 'bg-[#6366F1] text-white font-bold shadow-lg shadow-[#6366F1]/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={activeCategory === cat.name ? 'text-white' : 'text-gray-600'}>{cat.count}</span>
                </button>
              </li>
            ))}
          </ul>
          <button className="flex items-center space-x-1 text-[#6366F1] text-sm font-bold mt-3 px-3 hover:text-[#818cf8] transition-colors">
            <span>Show More</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Difficulty */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Difficulty</h3>
          <ul className="space-y-3 px-1">
            {DIFFICULTIES.map((diff) => (
              <li key={diff} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`diff-${diff}`} 
                  checked={activeDiff === diff}
                  onChange={() => setActiveDiff(diff)}
                  className="w-4 h-4 rounded bg-[#111228] border-gray-600 text-[#6366F1] focus:ring-[#6366F1] focus:ring-offset-[#05050F]"
                />
                <label htmlFor={`diff-${diff}`} className="ml-3 text-sm text-gray-300 cursor-pointer hover:text-white">
                  {diff}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Features</h3>
          <ul className="space-y-3 px-1">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`feat-${feat}`} 
                  checked={activeFeatures.includes(feat)}
                  onChange={() => toggleFeature(feat)}
                  className="w-4 h-4 rounded bg-[#111228] border-gray-600 text-[#6366F1] focus:ring-[#6366F1] focus:ring-offset-[#05050F]"
                />
                <label htmlFor={`feat-${feat}`} className="ml-3 text-sm text-gray-300 cursor-pointer hover:text-white">
                  {feat}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={resetFilters}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-[#6366F1]/30 text-[#6366F1] font-bold hover:bg-[#6366F1]/10 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>

      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-white/5 gap-4">
          <div className="text-lg">
            <span className="font-bold text-[#6366F1]">523</span> <span className="text-gray-300">Games Found</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Sort by:</span>
              <div className="relative">
                <select className="appearance-none bg-[#111228] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-white focus:outline-none focus:border-[#6366F1] cursor-pointer">
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center bg-[#111228] rounded-lg p-1 border border-white/5">
              <button className="p-1.5 rounded bg-[#6366F1] text-white shadow">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded text-gray-500 hover:text-white transition-colors">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 flex-1">
          {displayGames.map((game) => (
            <GameCard 
              key={game.id}
              title={game.title}
              category={game.category}
              slug={game.slug}
              plays={game.mockPlays}
              rating={game.mockRating}
              imageUrl={game.image}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 mt-12 mb-8">
          <button className="w-10 h-10 rounded-xl bg-[#111228] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {[1, 2, 3, 4, 5].map(page => (
            <button 
              key={page}
              className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
                page === 1 
                  ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20' 
                  : 'bg-[#111228] border border-white/5 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {page}
            </button>
          ))}
          
          <span className="w-10 h-10 flex items-center justify-center text-gray-500">...</span>
          
          <button className="w-10 h-10 rounded-xl bg-[#111228] border border-white/5 font-bold flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
            11
          </button>
          
          <button className="w-10 h-10 rounded-xl bg-[#111228] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <NewsletterBanner />

      </div>
    </div>
  );
}
