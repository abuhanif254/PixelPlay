'use client';
import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Top 10 Puzzle Games to Keep Your Brain Sharp', author: 'Sarah P.', date: 'Aug 14, 2026', status: 'Published', views: '12.4K' },
    { id: 2, title: 'Why 2048 Remains the Most Addictive Browser Game', author: 'Mike D.', date: 'Aug 12, 2026', status: 'Published', views: '8.1K' },
    { id: 3, title: 'The Evolution of HTML5 Browser Games', author: 'Admin', date: 'Aug 10, 2026', status: 'Draft', views: '-' },
    { id: 4, title: 'Mastering Strategy: Tips for Chess Beginners', author: 'Sarah P.', date: 'Aug 05, 2026', status: 'Published', views: '5.2K' },
    { id: 5, title: 'Classic Arcade Games You Must Play', author: 'Mike D.', date: 'Aug 01, 2026', status: 'Published', views: '18.9K' },
  ]);

  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const toggleStatus = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' };
      }
      return p;
    }));
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight text-balance mb-1">
            Blog Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Write, edit, and manage SEO articles and blog content.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
            <Plus size={16} />
            New Article
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 w-full shadow-sm focus-within:border-[#10B981]/50 transition-colors">
        <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Search articles by title, author..." 
          className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article Title</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#0A0B1A] flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/5 text-gray-400 dark:text-gray-500">
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white max-w-[200px] md:max-w-md truncate">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{post.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{post.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      post.status === 'Published' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500 border border-green-200 dark:border-green-500/20' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{post.views}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Action Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === post.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-12 top-10 w-48 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20 text-left"
                        >
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Edit2 size={16} /> Edit Post
                          </button>
                          <button 
                            onClick={() => toggleStatus(post.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <Eye size={16} /> 
                            {post.status === 'Published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <div className="h-px bg-gray-100 dark:bg-white/5 w-full my-1"></div>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <Trash2 size={16} /> Delete Post
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
