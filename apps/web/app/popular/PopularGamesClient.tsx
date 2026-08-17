'use client';

import React, { useState, useMemo } from 'react';
import { Gamepad2, Calendar, Clock, Star, LayoutGrid, List, CheckSquare, Square, Search, Bell, ShieldCheck, MonitorSmartphone, ThumbsUp, Trophy, ChevronLeft, ChevronRight, Heart, Navigation } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import GameCard from '@/components/GameCard';

// ─── UTILS ────────────────────────────────────────────────
function isWithinDays(dateString: string | null | undefined, days: number): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= days;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return num.toString();
}

interface PopularGamesClientProps {
  initialGames?: any[];
}

const ITEMS_PER_PAGE = 16;

export default function PopularGamesClient({ initialGames = [] }: PopularGamesClientProps) {
  // State
  const [activeTab, setActiveTab] = useState('All Time');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Most Popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── DYNAMIC METRICS ───
  const { totalPlaysStr, avgRating, totalLikesStr, categories } = useMemo(() => {
    let totalPlays = 0;
    let totalRating = 0;
    let ratingCount = 0;
    const catMap: Record<string, number> = {};

    initialGames.forEach(game => {
      // Plays
      if (game.totalPlays) totalPlays += game.totalPlays;
      
      // Rating stats
      if (game.rating) {
        totalRating += game.rating;
        ratingCount++;
      }

      // Categories map
      if (game.category) {
        catMap[game.category] = (catMap[game.category] || 0) + 1;
      }
    });

    const average = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';
    
    // Simulate likes (e.g. 5% of total plays)
    const totalLikes = Math.floor(totalPlays * 0.05);

    // Format categories for sidebar
    const catsArray = Object.keys(catMap)
      .map(name => ({ name, count: catMap[name] }))
      .sort((a, b) => b.count - a.count);
    
    catsArray.unshift({ name: 'All Categories', count: initialGames.length });

    return {
      totalPlaysStr: formatNumber(totalPlays),
      avgRating: average,
      totalLikesStr: formatNumber(totalLikes),
      categories: catsArray
    };
  }, [initialGames]);

  // ─── FILTERING & SORTING ───
  const displayGames = useMemo(() => {
    // 1. Filter
    let filtered = initialGames.filter(game => {
      // Tab filter
      if (activeTab === 'This Week' && !isWithinDays(game.created_at, 7)) return false;
      if (activeTab === 'This Month' && !isWithinDays(game.created_at, 30)) return false;
      // 'All Popular' or 'All Time' handles everything
      
      // Category filter
      if (activeCategory !== 'All Categories' && game.category !== activeCategory) return false;

      // Search
      if (searchQuery && !game.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      if (sortBy === 'Newest First') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'Highest Rated') {
        return (b.rating || 0) - (a.rating || 0);
      }
      // default: Most Popular
      return (b.totalPlays || 0) - (a.totalPlays || 0);
    });

    return filtered;
  }, [initialGames, activeTab, activeCategory, sortBy, searchQuery]);

  // ─── PAGINATION ───
  const totalPages = Math.max(1, Math.ceil(displayGames.length / ITEMS_PER_PAGE));
  const paginatedGames = displayGames.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  // ─── SIDEBAR LISTS ───
  const trendingThisWeek = useMemo(() => {
    return [...initialGames]
      .filter(g => isWithinDays(g.created_at, 14)) // roughly recent
      .sort((a, b) => (b.totalPlays || 0) - (a.totalPlays || 0))
      .slice(0, 5);
  }, [initialGames]);

  const topRated = useMemo(() => {
    return [...initialGames]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [initialGames]);

  // Handle filter changes to reset page
  const setFilter = (type: 'tab' | 'category' | 'sort', val: string) => {
    if (type === 'tab') setActiveTab(val);
    if (type === 'category') setActiveCategory(val);
    if (type === 'sort') setSortBy(val);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-[1600px]">
      
      {/* ─── Breadcrumbs ─── */}
      <div className="flex items-center space-x-2 text-[13px] text-gray-600 dark:text-gray-400 mb-6 font-medium">
        <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-800 dark:text-gray-200">Popular Games</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* ════════ LEFT SIDEBAR ════════ */}
        <div className="w-full xl:w-[260px] flex-shrink-0 flex flex-col gap-4">
          
          {/* Categories Block */}
          <div className="bg-white dark:bg-[#111221] rounded-xl border border-gray-200 dark:border-white/5 p-5">
            <h3 className="text-gray-900 dark:text-white font-bold text-[15px] mb-4">Categories</h3>
            <ul className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {categories.map((cat, idx) => (
                <li key={cat.name}>
                  <button 
                    onClick={() => setFilter('category', cat.name)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-[13px] transition-colors ${activeCategory === cat.name ? 'bg-purple-600/10 text-purple-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Gamepad2 className="w-4 h-4 opacity-70" />}
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-[11px] opacity-60 font-mono">{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button className="mt-4 text-[13px] text-purple-400 font-medium hover:text-purple-300 transition-colors px-2">
              View All Categories &rarr;
            </button>
          </div>

          {/* Filters Block */}
          <div className="bg-white dark:bg-[#111221] rounded-xl border border-gray-200 dark:border-white/5 p-5">
            <h3 className="text-gray-900 dark:text-white font-bold text-[15px] mb-4">Filters</h3>
            
            {/* Sort By Dropdown inside Filters */}
            <div className="mb-5">
              <h4 className="text-[13px] text-gray-700 dark:text-gray-300 mb-2">Sort By</h4>
              <select 
                value={sortBy}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1A1B2E] border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option>Most Popular</option>
                <option>Newest First</option>
                <option>Highest Rated</option>
              </select>
            </div>

            {/* Time Dropdown */}
            <div className="mb-5">
              <h4 className="text-[13px] text-gray-700 dark:text-gray-300 mb-2">Time</h4>
              <select 
                value={activeTab === 'All Popular' ? 'All Time' : activeTab}
                onChange={(e) => setFilter('tab', e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1A1B2E] border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option>All Time</option>
                <option>This Month</option>
                <option>This Week</option>
              </select>
            </div>

            {/* Rating Stars mock */}
            <div className="mb-6">
              <h4 className="text-[13px] text-gray-700 dark:text-gray-300 mb-2">Rating</h4>
              <div className="space-y-1.5">
                {[5, 4, 3].map(r => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-[#1A1B2E] flex items-center justify-center group-hover:border-purple-500"></div>
                    <div className="flex gap-1">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    {r === 3 && <span className="text-[11px] text-gray-500 ml-1">& Below</span>}
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[13px] py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Apply Filters
            </button>
          </div>

        </div>

        {/* ════════ MAIN COLUMN ════════ */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-purple-50 dark:from-[#140F2D] via-white dark:via-[#100D28] to-indigo-50 dark:to-[#0D1022] rounded-2xl border border-purple-500/20 p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Popular Games <span className="text-3xl">🔥</span></h1>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-[15px] leading-relaxed">
                  Play the most loved games by our community.<br/>
                  Top picks, high ratings, and non-stop fun!
                </p>
              </div>
              
              <div className="hidden md:flex relative w-48 h-32 items-center justify-center mt-4 md:mt-0">
                <Trophy className="w-28 h-28 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] relative z-10 animate-[bounce_3s_infinite]" strokeWidth={1} />
                <Gamepad2 className="w-16 h-16 text-purple-500 absolute -bottom-2 -right-4 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] transform rotate-12" strokeWidth={1} />
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 relative z-10">
              <div className="bg-white dark:bg-[#111221]/80 backdrop-blur border border-gray-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{totalPlaysStr}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-[11px]">Total Plays</div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#111221]/80 backdrop-blur border border-gray-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{avgRating}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-[11px]">Average Rating</div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#111221]/80 backdrop-blur border border-gray-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{totalLikesStr}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-[11px]">Likes</div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#111221]/80 backdrop-blur border border-gray-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white font-bold text-lg leading-tight">TOP</div>
                  <div className="text-gray-600 dark:text-gray-400 text-[11px]">Most Popular</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#111221] p-1 rounded-lg border border-gray-200 dark:border-white/5">
              {['All Popular', 'This Week', 'This Month', 'All Time'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter('tab', tab)}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${activeTab === tab ? 'bg-purple-600/20 text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-[12px]">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="bg-white dark:bg-[#111221] border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200 text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option>Most Popular</option>
                  <option>Newest First</option>
                  <option>Highest Rated</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-[#111221] p-1 rounded-lg border border-gray-200 dark:border-white/5">
                <button className="p-1.5 bg-purple-600/20 text-purple-400 rounded-md">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          {paginatedGames.length === 0 ? (
            <div className="bg-white dark:bg-[#111221] rounded-2xl border border-gray-200 dark:border-white/5 p-12 text-center">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">No games found</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {paginatedGames.map((game, index) => {
                // Calculate absolute rank if sorted by most popular
                const absoluteRank = sortBy === 'Most Popular' ? ((currentPage - 1) * ITEMS_PER_PAGE) + index + 1 : undefined;

                return (
                  <GameCard 
                    key={game.id}
                    title={game.title}
                    category={game.category}
                    imageUrl={game.image}
                    rating={game.rating || 5.0}
                    plays={formatNumber(game.totalPlays || 0) + ' plays'}
                    slug={game.slug || game.id}
                    rank={absoluteRank}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg bg-white dark:bg-[#111221] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                if (totalPages > 7 && page > 2 && page < totalPages - 1 && Math.abs(currentPage - page) > 1) {
                  if (page === 3 || page === totalPages - 2) return <span key={page} className="text-gray-500 px-1">...</span>;
                  return null;
                }
                
                return (
                  <button 
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all border border-gray-200 dark:border-white/5 ${
                      page === currentPage 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white dark:bg-[#111221] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg bg-white dark:bg-[#111221] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* ════════ RIGHT SIDEBAR ════════ */}
        <div className="w-full xl:w-[280px] flex-shrink-0 flex flex-col gap-6">
          
          {/* Trending This Week */}
          <div className="bg-white dark:bg-[#111221] rounded-xl border border-gray-200 dark:border-white/5 p-5">
            <h3 className="text-gray-900 dark:text-white font-bold text-[15px] mb-4 flex items-center gap-2">
              Trending This Week <span className="text-xl">🔥</span>
            </h3>
            
            <div className="space-y-4">
              {trendingThisWeek.length > 0 ? (
                trendingThisWeek.map((game, i) => (
                  <Link href={`/games/${game.slug || game.id}`} key={game.id} className="flex items-center gap-3 group cursor-pointer block">
                    <div className="w-4 text-gray-500 font-mono text-[13px] font-bold">{i + 1}</div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-100 dark:bg-[#05050F]">
                      {game.image && <Image src={game.image} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform" sizes="48px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] text-gray-800 dark:text-gray-200 font-bold truncate group-hover:text-purple-400 transition-colors">{game.title}</h4>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[11px] text-gray-500">{game.category}</span>
                        <div className="flex items-center text-[#F59E0B] gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{game.rating || '5.0'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-xs text-gray-500">No trending data available.</div>
              )}
            </div>
            
            <button className="w-full mt-5 bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-purple-400 font-semibold text-[12px] py-2 rounded-lg transition-colors">
              View Full Leaderboard &rarr;
            </button>
          </div>

          {/* Top Rated Games */}
          <div className="bg-white dark:bg-[#111221] rounded-xl border border-gray-200 dark:border-white/5 p-5">
            <h3 className="text-gray-900 dark:text-white font-bold text-[15px] mb-4">Top Rated Games</h3>
            
            <div className="space-y-4">
              {topRated.map((game, i) => {
                return (
                  <Link href={`/games/${game.slug || game.id}`} key={game.id} className="flex items-center gap-3 group cursor-pointer block">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-100 dark:bg-[#05050F]">
                      {game.image && <Image src={game.image} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform" sizes="40px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] text-gray-800 dark:text-gray-200 font-bold truncate group-hover:text-purple-400 transition-colors">{game.title}</h4>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-[10px] text-gray-500">{game.category}</span>
                        <div className="flex items-center gap-1 text-[#F59E0B]">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{game.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <button 
              onClick={() => {
                setFilter('sort', 'Highest Rated');
                setFilter('tab', 'All Popular');
              }}
              className="w-full mt-5 bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-purple-400 font-semibold text-[12px] py-2 rounded-lg transition-colors"
            >
              View All Top Rated &rarr;
            </button>
          </div>

          {/* Newsletter Box */}
          <div className="bg-purple-50 dark:bg-[#140C24] rounded-xl border border-purple-500/20 p-5 relative overflow-hidden">
            <div className="relative z-10 flex flex-col">
              <h3 className="text-gray-900 dark:text-white font-bold text-[14px] mb-2 flex items-center justify-between">
                Never Miss Popular Games!
                <div className="bg-purple-600 p-2 rounded-full">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed mb-4">
                Subscribe to get updates on the most popular games.
              </p>
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-[12px] text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 mb-2"
              />
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[12px] py-2 rounded-lg transition-colors">
                Subscribe
              </button>
              <p className="text-[10px] text-gray-500 mt-2 text-center">No spam. Unsubscribe anytime.</p>
            </div>
          </div>

        </div>

      </div>

      {/* ════════ FOOTER TRUST BAR ════════ */}
      <div className="mt-12 bg-white dark:bg-[#111221] border border-gray-200 dark:border-white/5 rounded-2xl p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          
          <div className="flex items-center gap-4 sm:px-4 first:pl-0">
            <div className="text-purple-500 bg-purple-500/10 p-2.5 rounded-xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-800 dark:text-gray-200 font-bold text-[14px]">Community Favorites</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">Top games loved by players</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 sm:pt-0 sm:px-4">
            <div className="text-green-500 bg-green-500/10 p-2.5 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-800 dark:text-gray-200 font-bold text-[14px]">High Quality</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">Handpicked games with great gameplay</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 sm:pt-0 sm:px-4">
            <div className="text-blue-500 bg-blue-500/10 p-2.5 rounded-xl">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-800 dark:text-gray-200 font-bold text-[14px]">Regular Updates</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">New popular games added every week</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 sm:pt-0 sm:px-4 last:pr-0">
            <div className="text-purple-500 bg-purple-500/10 p-2.5 rounded-xl">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-800 dark:text-gray-200 font-bold text-[14px]">Play Anywhere</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">Enjoy on desktop, tablet or mobile</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
