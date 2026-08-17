'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Gamepad2, Shield, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UserDropdown({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, level, xp, role')
        .eq('id', userId)
        .single();
      
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!profile) return null; // Or a loading skeleton

  const menuItems = [
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Gamepad2, label: 'Developer Studio', href: '/studio' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  if (profile.role === 'admin') {
    menuItems.push({ icon: Shield, label: 'Admin Dashboard', href: '/admin' });
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            profile.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white max-w-[100px] truncate hidden sm:block">
          {profile.username}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform hidden sm:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#12132A] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
          >
            {/* Header: User Info */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-purple-600 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-inner">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    profile.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {profile.username}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-md">
                      LVL {profile.level || 1}
                    </span>
                    {profile.role === 'admin' && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="p-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={index} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      item.label === 'Admin Dashboard' 
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Footer: Sign Out */}
            <div className="p-2 border-t border-gray-200 dark:border-white/10">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
