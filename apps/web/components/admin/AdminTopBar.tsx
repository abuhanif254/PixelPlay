'use client';
import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdminTopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 bg-white/50 dark:bg-[#0A0B1A]/50 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="flex items-center bg-gray-100 dark:bg-[#111228] rounded-full px-4 py-2 w-full border border-gray-200 dark:border-white/5 focus-within:border-[#6366F1]/50 transition-colors">
          <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search games, users, or posts..." 
            className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 pl-6">
        
        {/* Dark Mode */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-full bg-gray-100 dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <div className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-full bg-gray-100 dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111228]" />
        </button>

        {/* Profile */}
        <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-full bg-[#111228] overflow-hidden cursor-pointer border border-gray-200 dark:border-white/5 ml-2">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4" alt="Admin" className="w-full h-full object-cover" />
        </motion.div>

      </div>
    </header>
  );
}
