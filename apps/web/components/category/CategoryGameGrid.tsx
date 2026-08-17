'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';
import { CategoryData } from '@/lib/mockCategories';

export default function CategoryGameGrid({ category, games }: { category: CategoryData, games: any[] }) {
  const [activeTag, setActiveTag] = useState('All');
  
  const tags = ['All', 'Logic', 'Math', 'Matching', 'Word', 'Brain', 'Physics', 'Classic'];

  return (
    <div className="flex flex-col w-full mb-12">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">{category.title}</h2>
          <span 
            className="text-xs font-bold px-2.5 py-1 rounded-md"
            style={{ backgroundColor: `${category.color}1A`, color: category.color }} // 1A is ~10% opacity
          >
            {category.stats.games} Games Found
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#6366F1] cursor-pointer appearance-none bg-no-repeat" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}>
              <option>Most Popular</option>
              <option>Newest First</option>
              <option>Top Rated</option>
            </select>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-lg p-1">
            <button 
              className="p-1.5 rounded-md text-white"
              style={{ backgroundColor: category.color }}
            >
              <LayoutGrid size={16} />
            </button>
            <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-category Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTag === tag
                ? 'text-white'
                : 'bg-transparent border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30'
            }`}
            style={activeTag === tag ? { backgroundColor: category.color } : {}}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 6-Column Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {games.length === 0 && (
           <div className="col-span-full py-20 text-center text-gray-500">
             No games found in this category yet.
           </div>
        )}
        {games.map((game, i) => (
          <Link href={`/games/${game.slug || game.id}`} key={game.id || i} className="flex flex-col group cursor-pointer relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111228]/50 hover:bg-gray-50 dark:hover:bg-[#111228] transition-all hover:-translate-y-1 hover:shadow-xl" style={{ ':hover': { borderColor: `${category.color}4D` } } as any}>
            {/* Image Box */}
            <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-800">
              <img src={game.image} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
              
              {/* Category Pill */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded">
                {game.category}
              </div>

              {/* Hover Play Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white pl-1 scale-75 group-hover:scale-100 transition-transform duration-300"
                  style={{ backgroundColor: category.color, boxShadow: `0 0 15px ${category.color}80` }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 flex flex-col gap-1.5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{game.title}</h3>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{game.total_plays || 0} plays</span>
                <div className="flex items-center gap-1 font-bold text-yellow-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {game.rating || '5.0'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center w-full">
        <button className="flex items-center gap-2 px-8 py-3 bg-transparent border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-bold rounded-xl transition-all">
          <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Load More Games
        </button>
      </div>

    </div>
  );
}
