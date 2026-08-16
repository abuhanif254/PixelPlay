"use client";

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { gamesRegistry } from '@spielcade/games/registry';
import Link from 'next/link';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter games based on query
  const results = Object.entries(gamesRegistry)
    .filter(([_, game]) => game.config.title.toLowerCase().includes(query.toLowerCase()) || game.config.category.toLowerCase().includes(query.toLowerCase()))
    .map(([slug, game]) => ({ slug, title: game.config.title, category: game.config.category }));

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50 z-10 pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      <input 
        type="text" 
        placeholder="Search games..." 
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all relative z-0"
      />

      {/* Dropdown Results */}
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((result) => (
                <li key={result.slug}>
                  <Link 
                    href={`/games/${result.slug}`} 
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    onClick={handleSelect}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{result.title}</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{result.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No games found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
