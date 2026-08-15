'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, History, Heart, Trophy, Gamepad2, BarChart2, Activity, Settings, LogOut, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

type ProfileData = {
  username: string;
  full_name: string;
  avatar_url: string;
  xp: number;
  level: number;
  xpProgress: number;
  xpForNextLevel: number;
};

export default function ProfileSidebar({ profile }: { profile: ProfileData }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',      href: '/profile' },
    { icon: History,         label: 'Recently Played', href: '/profile/recent' },
    { icon: Heart,           label: 'Favorite Games',  href: '/profile/favorites' },
    { icon: Trophy,          label: 'Achievements',    href: '/profile/achievements' },
    { icon: Gamepad2,        label: 'Game History',    href: '/profile/history' },
    { icon: BarChart2,       label: 'Leaderboard',     href: '/leaderboard' },
    { icon: Activity,        label: 'Activity Feed',   href: '/profile/activity' },
  ];

  return (
    <div className="w-64 shrink-0 flex flex-col gap-4">

      {/* Profile Info Card */}
      <div className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col items-center shadow-sm">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#6366F1] to-purple-500 mb-3 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-[#111228]">
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h2 className="text-base font-bold font-outfit text-gray-900 dark:text-white mb-0.5 text-center">
          {profile.full_name || profile.username}
        </h2>
        <p className="text-xs text-gray-400 mb-2">@{profile.username}</p>
        <span className="px-3 py-1 bg-[#6366F1]/20 text-[#6366F1] text-xs font-bold rounded-full mb-4">
          Level {profile.level}
        </span>

        {/* XP Progress */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>XP</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {profile.xp.toLocaleString()} / {profile.xpForNextLevel.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0A0B1A] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profile.xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-right">
            {profile.xpForNextLevel - profile.xp} XP to Level {profile.level + 1}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-3 shadow-sm flex flex-col gap-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/profile' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all overflow-hidden ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="profile-active-bg"
                    className="absolute inset-0 bg-[#6366F1] rounded-xl z-0"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={16} className="relative z-10 shrink-0" />
                <span className="text-sm font-medium relative z-10">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-3 shadow-sm flex flex-col gap-0.5">
        <Link href="/games">
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            <ExternalLink size={16} />
            <span className="text-sm font-medium">Browse Games</span>
          </motion.div>
        </Link>
        <button onClick={handleSignOut} className="w-full text-left">
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
            <span className="text-sm font-medium">Logout</span>
          </motion.div>
        </button>
      </div>

      {/* Next Level Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#6366F1]/5 to-transparent" />
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 w-full relative z-10">Next Level Reward</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 w-full relative z-10">Reach Level {profile.level + 1}</p>
        <div className="relative w-16 h-16 mb-3 z-10">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
          <div className="w-full h-full flex items-center justify-center text-4xl relative z-10">🏆</div>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0A0B1A] rounded-full overflow-hidden z-10">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${profile.xpProgress}%` }} />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 z-10">{profile.xpProgress}% to next level</p>
      </motion.div>

    </div>
  );
}
