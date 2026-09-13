'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PieChart, 
  Send, 
  DollarSign, 
  Key, 
  FileCode2, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface StudioSidebarProps {
  isAdmin?: boolean;
}

export default function StudioSidebar({ isAdmin = false }: StudioSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/studio', 
      icon: PieChart, 
      exact: true 
    },
    { 
      name: 'Submit Game', 
      href: '/studio/submit', 
      icon: Send 
    },
    { 
      name: '70% Revenue Share', 
      href: '/studio/revenue', 
      icon: DollarSign,
      color: 'text-emerald-500'
    },
    { 
      name: 'Master API Keys', 
      href: '/studio/keys', 
      icon: Key,
      color: 'text-amber-500'
    },
    { 
      name: 'SDK Simulator & Docs', 
      href: '/studio/docs', 
      icon: FileCode2,
      color: 'text-indigo-400'
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="flex flex-col gap-1.5 bg-white dark:bg-[#111228] p-3 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
        
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Studio Navigation
        </div>

        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname === item.href || pathname?.startsWith(item.href + '/');

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComponent 
                  size={16} 
                  className={isActive ? 'text-white' : item.color || 'text-gray-400'} 
                />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-80" />}
            </Link>
          );
        })}

        {/* Role-Gated Admin Link */}
        {isAdmin && (
          <>
            <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-2" />
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500/80">
              Admin Moderation
            </div>
            <Link
              href="/admin/games/queue"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                pathname?.startsWith('/admin')
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={16} />
                <span>Review Queue</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300">
                Staff
              </span>
            </Link>
          </>
        )}

      </nav>
    </aside>
  );
}
