'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Filter } from 'lucide-react';

export default function CategorySidebar() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Levels');
  const [selectedSort, setSelectedSort] = useState<string>('Most Popular');

  const categories = [
    { name: 'All Categories', count: null, icon: '🗂️' },
    { name: 'Puzzle Games', count: 125, icon: '🧩', active: true },
    { name: 'Action Games', count: 98, icon: '⚔️' },
    { name: 'Racing Games', count: 67, icon: '🏎️' },
    { name: 'Adventure Games', count: 56, icon: '🗺️' },
    { name: 'Arcade Games', count: 82, icon: '👾' },
    { name: 'Board Games', count: 43, icon: '🎲' },
    { name: 'Card Games', count: 38, icon: '🃏' },
    { name: 'Strategy Games', count: 41, icon: '♟️' },
    { name: 'Sports Games', count: 32, icon: '🏅' },
    { name: 'Kids Games', count: 29, icon: '👶' },
  ];

  const difficulties = [
    { name: 'All Levels', count: null },
    { name: 'Easy', count: 42 },
    { name: 'Medium', count: 57 },
    { name: 'Hard', count: 26 },
    { name: 'Expert', count: 10 },
  ];

  const features = [
    'Multiplayer', 'Single Player', 'No Time Limit', 'Mobile Friendly', 'No Download'
  ];

  const sorts = [
    'Most Popular', 'Newest First', 'Top Rated', 'Most Played', 'A - Z'
  ];

  return (
    <div className="w-full flex flex-col gap-8 pr-4">
      
      {/* Categories */}
      <div className="flex flex-col gap-1">
        <h4 className="font-bold text-white mb-2 px-1">Categories</h4>
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              cat.active 
                ? 'bg-[#6366F1]/20 text-[#6366F1] font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{cat.icon}</span>
              {cat.name}
            </div>
            {cat.count !== null && (
              <span className={cat.active ? 'text-[#6366F1]' : 'text-gray-500 text-xs'}>{cat.count}</span>
            )}
          </Link>
        ))}
        <button className="w-full mt-3 py-2 border border-white/10 hover:border-[#6366F1] text-[#6366F1] hover:text-white hover:bg-[#6366F1] text-xs font-bold rounded-lg transition-all">
          View All Categories
        </button>
      </div>

      {/* Filter Games */}
      <div className="flex flex-col gap-4">
        <h4 className="font-bold text-white px-1">Filter Games</h4>
        
        {/* Difficulty */}
        <div className="flex flex-col gap-2">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Difficulty</h5>
          {difficulties.map((diff, idx) => (
            <label key={idx} className="flex items-center gap-3 px-1 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4">
                <input 
                  type="checkbox" 
                  className="appearance-none w-4 h-4 border border-gray-600 rounded bg-[#111228] checked:bg-[#6366F1] checked:border-[#6366F1] transition-colors cursor-pointer"
                  checked={selectedDifficulty === diff.name}
                  onChange={() => setSelectedDifficulty(diff.name)}
                />
                {selectedDifficulty === diff.name && (
                  <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm transition-colors flex-1 flex justify-between ${selectedDifficulty === diff.name ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-300'}`}>
                {diff.name}
                {diff.count && <span className="text-gray-600 text-xs font-normal">({diff.count})</span>}
              </span>
            </label>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-col gap-2 mt-2">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Features</h5>
          {features.map((feat, idx) => (
            <label key={idx} className="flex items-center gap-3 px-1 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4">
                <input 
                  type="checkbox" 
                  className="appearance-none w-4 h-4 border border-gray-600 rounded bg-[#111228] checked:bg-[#6366F1] checked:border-[#6366F1] transition-colors cursor-pointer"
                />
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{feat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-white px-1 mb-2">Sort By</h4>
        {sorts.map((sort, idx) => (
          <label key={idx} className="flex items-center gap-3 px-1 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4">
              <input 
                type="radio" 
                name="sort"
                className="appearance-none w-4 h-4 border border-gray-600 rounded-full bg-[#111228] checked:border-[#6366F1] transition-colors cursor-pointer"
                checked={selectedSort === sort}
                onChange={() => setSelectedSort(sort)}
              />
              {selectedSort === sort && (
                <div className="absolute w-2 h-2 bg-[#6366F1] rounded-full pointer-events-none" />
              )}
            </div>
            <span className={`text-sm transition-colors ${selectedSort === sort ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-300'}`}>
              {sort}
            </span>
          </label>
        ))}
      </div>

      <button className="w-full bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl py-3 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#6366F1]/20">
        <Filter size={16} />
        Apply Filters
      </button>

    </div>
  );
}
