'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, X, CheckCheck, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { markAllNotificationsRead, markNotificationRead } from '@/app/admin/settings/actions';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const notifIcon: Record<string, string> = {
  new_user: '👤', new_score: '🏆', new_post: '📝', game_error: '⚠️', system: '⚙️'
};

export default function AdminTopBar({
  onOpenMobileSidebar,
}: {
  onOpenMobileSidebar?: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{ username: string; avatar_url: string } | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ games: any[]; users: any[] }>({ games: [], users: [] });
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch admin profile + notifications on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // Profile
      supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
        .then(({ data }) => { if (data) setAdminProfile(data); });
      // Notifications
      supabase.from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => { if (data) setNotifications(data); });
    });

    // Close dropdowns on outside click
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Global search
  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSearchResults({ games: [], users: [] }); setShowSearch(false); return; }
    const supabase = createClient();
    const q = search.toLowerCase();
    Promise.all([
      supabase.from('games').select('id, title, slug, category').ilike('title', `%${search}%`).limit(5),
      supabase.from('profiles').select('id, username, full_name, avatar_url').ilike('username', `%${search}%`).limit(5),
    ]).then(([{ data: games }, { data: users }]) => {
      setSearchResults({ games: games || [], users: users || [] });
      setShowSearch(true);
    });
  }, [search]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
    await markAllNotificationsRead();
  };

  const handleMarkOneRead = async (id: string) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
    await markNotificationRead(id);
  };

  return (
    <header className="h-20 bg-white/50 dark:bg-[#0A0B1A]/50 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 gap-3">

      {/* Mobile Hamburger Toggle */}
      <button
        onClick={onOpenMobileSidebar}
        aria-label="Open admin navigation menu"
        className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Global Search */}
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="flex items-center bg-gray-100 dark:bg-[#111228] rounded-full px-3 sm:px-4 py-2 w-full border border-gray-200 dark:border-white/5 focus-within:border-[#6366F1]/50 transition-colors">
          <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search games, users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => { setSearch(''); setShowSearch(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearch && (searchResults.games.length > 0 || searchResults.users.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-12 left-0 right-0 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {searchResults.games.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Games</p>
                  {searchResults.games.map(g => (
                    <Link
                      key={g.id}
                      href={`/admin/games`}
                      onClick={() => { setSearch(''); setShowSearch(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="w-7 h-7 rounded bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${g.slug}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{g.title}</p>
                        <p className="text-[10px] text-gray-400">{g.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.users.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/5">
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Users</p>
                  {searchResults.users.map(u => (
                    <Link
                      key={u.id}
                      href={`/admin/users`}
                      onClick={() => { setSearch(''); setShowSearch(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                        <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">@{u.username}</p>
                        {u.full_name && <p className="text-[10px] text-gray-400">{u.full_name}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-6 shrink-0">

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 sm:p-2.5 rounded-full bg-gray-100 dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <div className="w-4 h-4" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="p-2 sm:p-2.5 rounded-full bg-gray-100 dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1 border-2 border-white dark:border-[#0A0B1A]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 top-14 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Notifications {unreadCount > 0 && <span className="text-[#6366F1]">({unreadCount})</span>}
                  </h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-[10px] font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors">
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">No notifications yet</p>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <button
                        key={notif.id}
                        onClick={() => handleMarkOneRead(notif.id)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!notif.is_read ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{notifIcon[notif.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${notif.is_read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{notif.title}</p>
                          <p className="text-[10px] text-gray-400 truncate">{notif.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] text-gray-400">{timeAgo(notif.created_at)}</span>
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-[#6366F1]" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Avatar */}
        <Link href="/admin/settings">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 dark:border-white/10 hover:border-[#6366F1] transition-colors ml-1"
          >
            <img
              src={adminProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminProfile?.username || 'Admin'}&backgroundColor=b6e3f4`}
              alt={adminProfile?.username || 'Admin'}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </Link>

      </div>
    </header>
  );
}
