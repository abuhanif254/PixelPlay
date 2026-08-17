'use client';

import React, { useState } from 'react';
import { Gamepad2, Calendar, Clock, Star, LayoutGrid, List, CheckSquare, Square, Search, Bell, ShieldCheck, MonitorSmartphone, ThumbsUp, Trophy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import GameCard from '@/components/GameCard';

// ─── MOCK DATA (For Design Phase) ────────────────────────────────────────────────
const MOCK_GAMES = [
  { id: '1', title: 'Neon Drift', category: 'Racing', rating: 4.7, plays: '12K', isNew: true, image: 'https://images.unsplash.com/photo-1547637589-f551c6cbf104?auto=format&fit=crop&q=80&w=400' },
  { id: '2', title: 'Stickman Archer 3', category: 'Action', rating: 4.6, plays: '8K', isNew: true, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400' },
  { id: '3', title: 'Cat Cafe Tycoon', category: 'Simulation', rating: 4.8, plays: '24K', isNew: true, image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400' },
  { id: '4', title: 'Block Master 2024', category: 'Puzzle', rating: 4.5, plays: '5K', isNew: true, image: 'https://images.unsplash.com/photo-1618218168350-6e7c81151b64?auto=format&fit=crop&q=80&w=400' },
  { id: '5', title: 'AI Battle Arena', category: 'Action', rating: 4.6, plays: '33K', isNew: true, image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=400' },
  { id: '6', title: 'Farm VR', category: 'Simulation', rating: 4.4, plays: '15K', isNew: true, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400' },
  { id: '7', title: 'Ninja Run 2024', category: 'Arcade', rating: 4.7, plays: '40K', isNew: true, image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&q=80&w=400' },
  { id: '8', title: 'Mini Soccer League', category: 'Sports', rating: 4.5, plays: '11K', isNew: true, image: 'https://images.unsplash.com/photo-1518605368461-1e1e11af4401?auto=format&fit=crop&q=80&w=400' },
  { id: '9', title: 'Bubble Pop Mania', category: 'Puzzle', rating: 4.3, plays: '2K', isNew: true, image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=400' },
  { id: '10', title: 'Galaxy Invaders', category: 'Arcade', rating: 4.6, plays: '89K', isNew: true, image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=400' },
  { id: '11', title: 'Sudoku Classic', category: 'Puzzle', rating: 4.4, plays: '100K', isNew: true, image: 'https://images.unsplash.com/photo-1516975480577-62283e3ff379?auto=format&fit=crop&q=80&w=400' },
  { id: '12', title: 'Chess Online', category: 'Board', rating: 4.8, plays: '250K', isNew: true, image: 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&q=80&w=400' },
];

const CATEGORIES = [
  { name: 'All Categories', count: 128 },
  { name: 'Action Games', count: 18 },
  { name: 'Adventure Games', count: 16 },
  { name: 'Puzzle Games', count: 24 },
  { name: 'Racing Games', count: 12 },
  { name: 'Arcade Games', count: 15 },
  { name: 'Strategy Games', count: 10 },
  { name: 'Sports Games', count: 8 },
  { name: 'Board Games', count: 7 },
  { name: 'Card Games', count: 6 },
];

export default function NewGamesClient() {
  const [activeTab, setActiveTab] = useState('All New');
  const [activeCategory, setActiveCategory] = useState('All Categories');

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-[1600px]">
      
      {/* ─── Breadcrumbs ─── */}
      <div className="flex items-center space-x-2 text-[13px] text-gray-400 mb-6 font-medium">
        <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-gray-200">New Games</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* ════════ LEFT SIDEBAR ════════ */}
        <div className="w-full xl:w-[260px] flex-shrink-0 flex flex-col gap-4">
          
          {/* Categories Block */}
          <div className="bg-[#111221] rounded-xl border border-white/5 p-5">
            <h3 className="text-white font-bold text-[15px] mb-4">Categories</h3>
            <ul className="space-y-1.5">
              {CATEGORIES.map((cat, idx) => (
                <li key={cat.name}>
                  <button 
                    onClick={() => setActiveCategory(cat.name)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-[13px] transition-colors ${activeCategory === cat.name ? 'bg-purple-600/10 text-purple-400 font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Gamepad2 className="w-4 h-4 opacity-70" />}
                      {/* Icons can be added based on category name if desired */}
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-[11px] opacity-60 font-mono">{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button className="mt-4 text-[13px] text-purple-400 font-medium hover:text-purple-300 transition-colors px-2">
              View All Categories →
            </button>
          </div>

          {/* Filters Block */}
          <div className="bg-[#111221] rounded-xl border border-white/5 p-5">
            <h3 className="text-white font-bold text-[15px] mb-4">Filter Games</h3>
            
            {/* Rating */}
            <div className="mb-5">
              <h4 className="text-[13px] text-gray-300 mb-2">Rating</h4>
              <div className="flex gap-2">
                {[5, '4+', '3+', '2+'].map(r => (
                  <button key={r.toString()} className="flex-1 bg-[#1A1B2E] border border-white/5 rounded-lg py-1.5 flex items-center justify-center gap-1 text-[12px] text-gray-300 hover:bg-white/10 transition-colors">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Players */}
            <div className="mb-5">
              <h4 className="text-[13px] text-gray-300 mb-2">Players</h4>
              <div className="space-y-2">
                {['Single Player', 'Two Player', 'Multiplayer'].map(p => (
                  <label key={p} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-white/20 bg-[#1A1B2E] flex items-center justify-center group-hover:border-purple-500">
                      {/* Mock checked state logic could go here */}
                    </div>
                    <span className="text-[13px] text-gray-400 group-hover:text-gray-200">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-[13px] text-gray-300 mb-2">Features</h4>
              <div className="space-y-2">
                {['HTML5', 'No Download', 'Mobile Friendly'].map(f => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-white/20 bg-[#1A1B2E] flex items-center justify-center group-hover:border-purple-500">
                    </div>
                    <span className="text-[13px] text-gray-400 group-hover:text-gray-200">{f}</span>
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
          <div className="bg-gradient-to-r from-[#1E1235] to-[#120B21] rounded-2xl border border-purple-500/20 p-6 lg:p-8 relative overflow-hidden">
            
            {/* Abstract Background Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">New Games</h1>
                  <span className="bg-purple-600 text-white text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                    NEW
                  </span>
                </div>
                <p className="text-gray-300 text-sm md:text-[15px] leading-relaxed">
                  Explore the latest games added to PlayHub.<br/>
                  Fresh, fun and exciting games every week!
                </p>
              </div>
              
              {/* Optional 3D Illustration Area */}
              <div className="hidden md:flex relative w-48 h-32 items-center justify-center mt-4 md:mt-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                {/* Fallback for the cool purple gift box/controller in the screenshot */}
                <Gamepad2 className="w-24 h-24 text-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] relative z-10 animate-pulse" strokeWidth={1} />
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 relative z-10">
              <div className="bg-[#111221]/80 backdrop-blur border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-tight">128</div>
                  <div className="text-gray-400 text-[11px]">New Games</div>
                </div>
              </div>
              <div className="bg-[#111221]/80 backdrop-blur border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-pink-500/20 p-2 rounded-lg text-pink-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-tight">24</div>
                  <div className="text-gray-400 text-[11px]">This Week</div>
                </div>
              </div>
              <div className="bg-[#111221]/80 backdrop-blur border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-tight">78</div>
                  <div className="text-gray-400 text-[11px]">This Month</div>
                </div>
              </div>
              <div className="bg-[#111221]/80 backdrop-blur border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-tight">4.6</div>
                  <div className="text-gray-400 text-[11px]">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#111221] p-1 rounded-lg border border-white/5">
              {['All New', 'This Week', 'This Month'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${activeTab === tab ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[12px]">Sort by:</span>
                <select className="bg-[#111221] border border-white/5 text-gray-200 text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer">
                  <option>Newest First</option>
                  <option>Highest Rated</option>
                  <option>Most Played</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-[#111221] p-1 rounded-lg border border-white/5">
                <button className="p-1.5 bg-purple-600/20 text-purple-400 rounded-md">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {MOCK_GAMES.map(game => (
              <GameCard 
                key={game.id}
                title={game.title}
                category={game.category}
                imageUrl={game.image}
                rating={game.rating}
                plays={game.plays}
                slug={game.id}
                isNew={game.isNew}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <button className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[13px] font-bold">1</button>
            <button className="w-8 h-8 rounded-lg bg-[#111221] hover:bg-white/10 text-gray-400 flex items-center justify-center text-[13px] transition-colors border border-white/5">2</button>
            <button className="w-8 h-8 rounded-lg bg-[#111221] hover:bg-white/10 text-gray-400 flex items-center justify-center text-[13px] transition-colors border border-white/5">3</button>
            <button className="w-8 h-8 rounded-lg bg-[#111221] hover:bg-white/10 text-gray-400 flex items-center justify-center text-[13px] transition-colors border border-white/5">4</button>
            <span className="text-gray-500 px-1">...</span>
            <button className="w-8 h-8 rounded-lg bg-[#111221] hover:bg-white/10 text-gray-400 flex items-center justify-center text-[13px] transition-colors border border-white/5">11</button>
            <button className="px-3 h-8 rounded-lg bg-[#111221] hover:bg-white/10 text-gray-300 flex items-center justify-center text-[13px] transition-colors border border-white/5 ml-1">
              Next &rarr;
            </button>
          </div>

        </div>

        {/* ════════ RIGHT SIDEBAR ════════ */}
        <div className="w-full xl:w-[280px] flex-shrink-0 flex flex-col gap-6">
          
          {/* Trending This Week */}
          <div className="bg-[#111221] rounded-xl border border-white/5 p-5">
            <h3 className="text-white font-bold text-[15px] mb-4 flex items-center gap-2">
              Trending This Week <span className="text-xl">🔥</span>
            </h3>
            
            <div className="space-y-4">
              {MOCK_GAMES.slice(0, 3).map((game, i) => (
                <div key={game.id} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-4 text-gray-500 font-mono text-[13px] font-bold">{i + 1}</div>
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0">
                    <Image src={game.image} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] text-gray-200 font-bold truncate group-hover:text-purple-400 transition-colors">{game.title}</h4>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[11px] text-gray-500">{game.category}</span>
                      <div className="flex items-center text-[#F59E0B] gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span className="text-[11px] font-bold text-gray-300">{game.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-400 font-semibold text-[12px] py-2 rounded-lg transition-colors">
              View Trending Games
            </button>
          </div>

          {/* Recently Added */}
          <div className="bg-[#111221] rounded-xl border border-white/5 p-5">
            <h3 className="text-white font-bold text-[15px] mb-4">Recently Added</h3>
            
            <div className="space-y-4">
              {MOCK_GAMES.slice(3, 7).map((game, i) => (
                <div key={game.id} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0">
                    <Image src={game.image} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] text-gray-200 font-bold truncate group-hover:text-purple-400 transition-colors">{game.title}</h4>
                    <span className="text-[10px] text-gray-500">{['2 hours ago', '4 hours ago', '1 day ago', '1 day ago'][i]}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-400 font-semibold text-[12px] py-2 rounded-lg transition-colors">
              View All New Games
            </button>
          </div>

          {/* Newsletter Box */}
          <div className="bg-gradient-to-br from-[#23153c] to-[#120B21] rounded-xl border border-purple-500/20 p-5 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-10">
              <Bell className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-purple-500/20 p-3 rounded-full mb-3 text-purple-400">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-[15px] mb-1">Never Miss New Games!</h3>
              <p className="text-gray-400 text-[12px] leading-relaxed mb-4">
                Get notified when new games are added to PlayHub.
              </p>
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-purple-500 mb-2"
              />
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[13px] py-2 rounded-lg transition-colors">
                Subscribe
              </button>
              <p className="text-[10px] text-gray-500 mt-2">No spam, unsubscribe anytime.</p>
            </div>
          </div>

        </div>

      </div>

      {/* ════════ FOOTER TRUST BAR ════════ */}
      <div className="mt-12 bg-[#111221] border border-white/5 rounded-2xl p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          
          <div className="flex items-center gap-4 sm:px-4 first:pl-0">
            <div className="text-purple-500 bg-purple-500/10 p-2.5 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-200 font-bold text-[14px]">New Games Every Week</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">Fresh games added weekly</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 sm:pt-0 sm:px-4">
            <div className="text-purple-500 bg-purple-500/10 p-2.5 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-200 font-bold text-[14px]">Handpicked Quality</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">Only the best games for you</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 sm:pt-0 sm:px-4">
            <div className="text-purple-500 bg-purple-500/10 p-2.5 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-200 font-bold text-[14px]">Safe & Secure</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">100% safe gaming experience</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 sm:pt-0 sm:px-4 last:pr-0">
            <div className="text-purple-500 bg-purple-500/10 p-2.5 rounded-xl">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-200 font-bold text-[14px]">Play Anywhere</h4>
              <p className="text-gray-500 text-[12px] mt-0.5">Desktop, tablet & mobile</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
