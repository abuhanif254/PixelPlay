'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Gamepad2, FileText, Users, Settings,
  LogOut, ChevronRight, ExternalLink, Sparkles, X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState<{
    username: string; avatar_url: string; full_name: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => { if (data) setAdminProfile(data); });
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',    href: '/admin' },
    { icon: Gamepad2,        label: 'Games',        href: '/admin/games' },
    { icon: Sparkles,        label: 'Import Games', href: '/admin/games/import' },
    { icon: FileText,        label: 'Blog',         href: '/admin/blog' },
    { icon: Users,           label: 'Users',        href: '/admin/users' },
    { icon: Settings,        label: 'Settings',     href: '/admin/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0A0B1A]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Mobile Close Button */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5 shrink-0">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              Admin<span className="text-[#6366F1]">Panel</span>
            </span>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            aria-label="Close admin menu"
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Menu</div>

          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname?.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href} onClick={onClose} className="block">
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all overflow-hidden ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-bg"
                      className="absolute inset-0 bg-[#6366F1] rounded-xl shadow-lg shadow-[#6366F1]/20 z-0"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon size={18} className="relative z-10 shrink-0" />
                  <span className="text-sm font-semibold relative z-10">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto relative z-10 opacity-70" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer � Admin Profile + Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-white/5 flex flex-col gap-1 shrink-0">
          {/* Admin info card */}
          {adminProfile && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                <img
                  src={adminProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminProfile.username}`}
                  alt={adminProfile.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {adminProfile.full_name || adminProfile.username}
                </p>
                <p className="text-[10px] text-[#6366F1] font-semibold">Admin</p>
              </div>
            </div>
          )}

          <Link href="/" target="_blank" className="block">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <ExternalLink size={18} />
              <span className="text-sm font-semibold">View Site</span>
            </motion.div>
          </Link>

          <button onClick={handleSignOut} className="w-full">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
              <span className="text-sm font-semibold">Logout</span>
            </motion.div>
          </button>
        </div>
      </aside>
    </>
  );
}
