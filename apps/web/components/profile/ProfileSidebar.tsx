'use client';
import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  History, 
  Heart, 
  Trophy, 
  Gamepad2, 
  FolderHeart, 
  BarChart2, 
  Activity, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true, href: '/profile' },
    { icon: History, label: 'Recently Played', href: '/profile/recent' },
    { icon: Heart, label: 'Favorite Games', href: '/profile/favorites' },
    { icon: Trophy, label: 'Achievements', href: '/profile/achievements' },
    { icon: Gamepad2, label: 'Game History', href: '/profile/history' },
    { icon: FolderHeart, label: 'My Collections', href: '/profile/collections' },
    { icon: BarChart2, label: 'Leaderboard', href: '/leaderboard' },
    { icon: Activity, label: 'Activity Feed', href: '/profile/activity' },
  ];

  return (
    <div className="w-64 shrink-0 flex flex-col gap-6">
      
      {/* Profile Info Card */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent bg-gradient-to-tr from-[#6366F1] to-purple-500 p-0.5 relative mb-4">
          <div className="w-full h-full bg-gray-100 dark:bg-[#111228] rounded-full overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=GameMaster&backgroundColor=b6e3f4" alt="GameMaster avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#0A0B1A] rounded-full"></div>
        </div>
        
        <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-1">GameMaster</h2>
        <span className="px-3 py-1 bg-[#6366F1]/20 text-[#6366F1] text-xs font-bold rounded-full mb-4">Level 28</span>
        
        <div className="w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
          <span>XP</span>
          <span className="text-gray-900 dark:text-gray-300">12,450 / 20,000</span>
        </div>
        
        {/* XP Progress Bar */}
        <div className="w-full h-1.5 bg-[#111228] rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-full" style={{ width: '62%' }}></div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 w-full border-t border-b border-gray-200 dark:border-white/5 py-4 relative">
        {menuItems.map((item, index) => (
          <Link 
            href={item.href} 
            key={index}
            className="block"
          >
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative z-10 ${
                item.active 
                  ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </nav>

      <nav className="flex flex-col gap-1 w-full">
        <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </motion.button>
        <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </nav>

      {/* Next Level Reward Widget */}
      <motion.div 
        whileHover={{ y: -4, scale: 1.02 }}
        className="mt-4 bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden group shadow-sm hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] dark:hover:border-[#6366F1]/50"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#6366F1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 w-full">Next Level Reward</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 w-full">Reach Level 30</p>
        
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
          {/* Using a placeholder emoji or image for the treasure chest */}
          <div className="w-full h-full flex items-center justify-center text-5xl relative z-10">
            📦
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-gray-100 dark:bg-[#0A0B1A] rounded-full overflow-hidden mt-2 relative">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '62%' }}></div>
        </div>
        <div className="w-full text-center text-xs text-gray-500 dark:text-gray-400 mt-2">12,450 / 20,000 XP</div>
      </motion.div>
    </div>
  );
}
