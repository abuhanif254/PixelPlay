'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Gamepad2, ArrowRight, Clock, Star, Sparkles, Smartphone, Keyboard, Flame } from 'lucide-react';
const POPULAR_DEFAULT_GAMES = [
  { slug: 'neon-snake', title: 'Neon Snake', category: 'Arcade', rating: 4.9, image: 'https://spielcade.com/og-default.jpg', isTouchFriendly: true },
  { slug: '2048', title: '2048 Classic', category: 'Puzzle', rating: 4.8, image: 'https://spielcade.com/og-default.jpg', isTouchFriendly: true },
  { slug: 'neon-flyer', title: 'Neon Flyer', category: 'Action', rating: 4.7, image: 'https://spielcade.com/og-default.jpg', isTouchFriendly: true },
  { slug: 'flappy-bird', title: 'Flappy Wings', category: 'Arcade', rating: 4.6, image: 'https://spielcade.com/og-default.jpg', isTouchFriendly: true },
  { slug: 'chess-master', title: 'Chess Master', category: 'Strategy', rating: 4.8, image: 'https://spielcade.com/og-default.jpg', isTouchFriendly: true },
  { slug: 'drift-hunters', title: 'Drift Hunters', category: 'Racing', rating: 4.9, image: 'https://spielcade.com/og-default.jpg', isTouchFriendly: true },
];

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENRE_CHIPS = [
  'All',
  'Action',
  'Arcade',
  'Puzzle',
  'Racing',
  'Strategy',
  'Sports'
];

export default function SpotlightSearchModal({ isOpen, onClose }: SpotlightSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>(POPULAR_DEFAULT_GAMES);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('spielcade_recent_searches');
      if (cached) {
        setRecentSearches(JSON.parse(cached));
      }
    } catch {}
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic (combines API search with curated games)
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim().toLowerCase();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        let fetchedResults: any[] = [];
        if (trimmed.length >= 1) {
          const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
          const data = await res.json();
          if (Array.isArray(data)) fetchedResults = data;
          else if (Array.isArray(data?.games)) fetchedResults = data.games;
        }

        const localMatches = POPULAR_DEFAULT_GAMES.filter(g => 
          !trimmed || g.title.toLowerCase().includes(trimmed) || g.category.toLowerCase().includes(trimmed)
        );

        // Merge without duplicates
        const seen = new Set<string>();
        const merged: any[] = [];
        [...fetchedResults, ...localMatches].forEach((game: any) => {
          if (!seen.has(game.slug)) {
            seen.add(game.slug);
            merged.push({
              id: game.id || game.slug,
              slug: game.slug,
              title: game.title,
              category: game.category || 'Arcade',
              rating: game.rating || 4.8,
              image: game.image_url || game.image || 'https://spielcade.com/og-default.jpg',
              isTouchFriendly: true,
            });
          }
        });

        // Filter by genre chip if not 'All'
        const filtered = selectedGenre === 'All'
          ? merged
          : merged.filter(g => g.category?.toLowerCase() === selectedGenre.toLowerCase());

        setResults(filtered.slice(0, 8));
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, selectedGenre, isOpen]);

  const saveRecentSearch = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('spielcade_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectGame = useCallback((slug: string) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    onClose();
    router.push(`/games/${slug}`);
  }, [query, onClose, router]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectGame(results[selectedIndex].slug);
        } else if (query.trim()) {
          onClose();
          router.push(`/games?search=${encodeURIComponent(query.trim())}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, handleSelectGame, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0D0E22] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="relative flex items-center px-6 py-4 border-b border-gray-100 dark:border-white/10 gap-3">
          <Search size={20} className="text-[#6366F1] shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search thousands of games, genres, or tags... (Press ↑↓ to navigate)"
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg">
            ESC
          </kbd>
        </div>

        {/* Quick Genre Filter Chips */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-white/5 overflow-x-auto custom-scrollbar">
          {GENRE_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setSelectedGenre(chip)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                selectedGenre === chip
                  ? 'bg-[#6366F1] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto custom-scrollbar p-4 flex-grow space-y-3">
          
          {/* Recent Searches (when query is empty) */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> Recent Searches
                </span>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('spielcade_recent_searches');
                  }}
                  className="text-[10px] lowercase hover:text-rose-400 transition-colors"
                >
                  clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2 px-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-transparent hover:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 ? (
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
                {isSearching ? 'Searching...' : `Games Found (${results.length})`}
              </span>
              {results.map((game, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={game.slug}
                    onClick={() => handleSelectGame(game.slug)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-black/40 shrink-0 border border-white/10">
                        <img
                          src={game.image || 'https://spielcade.com/og-default.jpg'}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold truncate">
                            {game.title}
                          </h4>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {game.category || 'Arcade'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs opacity-80">
                          <span className="flex items-center gap-1">
                            <Star size={11} className="fill-current text-yellow-400" />
                            {game.rating || 4.8}
                          </span>
                          <span className="flex items-center gap-1">
                            <Smartphone size={11} /> Touch & Mobile Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-2 shrink-0">
                      {isSelected && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 px-2 py-1 rounded-lg">
                          Press Enter <ArrowRight size={11} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query && !isSearching ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <Gamepad2 size={36} className="mx-auto text-gray-400 mb-2 opacity-40" />
              <p className="text-sm font-bold">No games found matching "{query}"</p>
              <p className="text-xs mt-1">Try searching for "Snake", "2048", "Puzzle", or "Action".</p>
            </div>
          ) : null}

        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-black/40 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">↑</kbd> <kbd className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">↓</kbd> Navigate</span>
            <span><kbd className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">↵</kbd> Play Game</span>
            <span><kbd className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">esc</kbd> Close</span>
          </div>
          <span className="hidden sm:inline">Instant Game Finder</span>
        </div>

      </div>
    </div>
  );
}
