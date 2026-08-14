'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Gamepad2, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Gamepad2, label: 'Games', href: '/admin/games' },
    { icon: FileText, label: 'Blog', href: '/admin/blog' },
    { icon: Users, label: 'Users', href: '/admin/users' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0A0B1A]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col z-50">
      
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-white/5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-purple-600 flex items-center justify-center text-white">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
            Admin<span className="text-[#6366F1]">Panel</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group overflow-hidden ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="admin-active-bg"
                    className="absolute inset-0 bg-[#6366F1] rounded-xl shadow-lg shadow-[#6366F1]/20 z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon size={18} className="relative z-10" />
                <span className="text-sm font-semibold relative z-10">{item.label}</span>
                
                {isActive && (
                  <ChevronRight size={16} className="ml-auto relative z-10 opacity-70" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5 flex flex-col gap-2">
        <Link href="/" className="block">
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            <Gamepad2 size={18} />
            <span className="text-sm font-semibold">View Site</span>
          </motion.div>
        </Link>
        <button className="w-full">
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            <Settings size={18} />
            <span className="text-sm font-semibold">Settings</span>
          </motion.div>
        </button>
        <button className="w-full">
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </motion.div>
        </button>
      </div>
      
    </aside>
  );
}
