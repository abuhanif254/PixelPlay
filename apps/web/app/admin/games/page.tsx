'use client';
import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, EyeOff, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminGamesPage() {
  const [games, setGames] = useState([
    { id: 1, title: '2048', category: 'Puzzle', plays: '1.2M', rating: '4.8', status: 'Active', image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=100&auto=format&fit=crop' },
    { id: 2, title: 'Sudoku', category: 'Puzzle', plays: '850K', rating: '4.7', status: 'Active', image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=100&auto=format&fit=crop' },
    { id: 3, title: 'Snake 3D', category: 'Arcade', plays: '2.4M', rating: '4.9', status: 'Active', image: 'https://images.unsplash.com/photo-1518063319789-7217e3706b32?q=80&w=100&auto=format&fit=crop' },
    { id: 4, title: 'Chess Master', category: 'Strategy', plays: '500K', rating: '4.5', status: 'Draft', image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=100&auto=format&fit=crop' },
    { id: 5, title: 'Word Search', category: 'Puzzle', plays: '150K', rating: '4.2', status: 'Maintenance', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=100&auto=format&fit=crop' },
  ]);

  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const toggleStatus = (id: number) => {
    setGames(games.map(g => {
      if (g.id === id) {
        return { ...g, status: g.status === 'Active' ? 'Draft' : 'Active' };
      }
      return g;
    }));
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight text-balance mb-1">
            Games Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Add, edit, or disable games on the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
            <Plus size={16} />
            Add Game
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 w-full shadow-sm focus-within:border-[#6366F1]/50 transition-colors">
        <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Search by game title, category..." 
          className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Game</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plays</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                        <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{game.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{game.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      game.status === 'Active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500 border border-green-200 dark:border-green-500/20' 
                        : game.status === 'Draft'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500 border border-red-200 dark:border-red-500/20'
                    }`}>
                      {game.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{game.plays}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                      <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {game.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === game.id ? null : game.id)}
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Action Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === game.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-12 top-10 w-48 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20 text-left"
                        >
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Edit2 size={16} /> Edit Game
                          </button>
                          <button 
                            onClick={() => toggleStatus(game.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            {game.status === 'Active' ? (
                              <><EyeOff size={16} /> Set as Draft</>
                            ) : (
                              <><Eye size={16} /> Set Active</>
                            )}
                          </button>
                          <div className="h-px bg-gray-100 dark:bg-white/5 w-full my-1"></div>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <Trash2 size={16} /> Delete Game
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
