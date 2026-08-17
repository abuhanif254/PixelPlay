'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Notification = {
  id: string;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();

    // Setup realtime subscription
    const channel = supabase.channel('user-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0A0B1A]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#12132A] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#6366F1]" />
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-semibold flex items-center gap-1 bg-[#6366F1]/10 px-2 py-1 rounded-md transition-colors"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 opacity-40" />
                  </div>
                  You're all caught up!
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
                  {notifications.map(notif => {
                    // Determine Icon and Colors based on Type
                    let Icon = Bell;
                    let iconBg = 'bg-gray-100 dark:bg-white/10';
                    let iconColor = 'text-gray-500 dark:text-gray-400';
                    
                    if (notif.type === 'achievement') {
                      Icon = require('lucide-react').Trophy;
                      iconBg = 'bg-yellow-100 dark:bg-yellow-500/20';
                      iconColor = 'text-yellow-600 dark:text-yellow-400';
                    } else if (notif.type === 'follower') {
                      Icon = require('lucide-react').User;
                      iconBg = 'bg-blue-100 dark:bg-blue-500/20';
                      iconColor = 'text-blue-600 dark:text-blue-400';
                    } else if (notif.type === 'level_up') {
                      Icon = require('lucide-react').Rocket;
                      iconBg = 'bg-purple-100 dark:bg-purple-500/20';
                      iconColor = 'text-purple-600 dark:text-purple-400';
                    } else if (notif.type === 'new_game') {
                      Icon = require('lucide-react').Gamepad2;
                      iconBg = 'bg-green-100 dark:bg-green-500/20';
                      iconColor = 'text-green-600 dark:text-green-400';
                    } else if (notif.type === 'new_blog') {
                      Icon = require('lucide-react').Newspaper;
                      iconBg = 'bg-orange-100 dark:bg-orange-500/20';
                      iconColor = 'text-orange-600 dark:text-orange-400';
                    } else if (notif.type === 'welcome') {
                      Icon = require('lucide-react').PartyPopper;
                      iconBg = 'bg-pink-100 dark:bg-pink-500/20';
                      iconColor = 'text-pink-600 dark:text-pink-400';
                    }

                    const Content = () => (
                      <div className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3 group relative ${!notif.is_read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`} onClick={() => !notif.is_read && markAsRead(notif.id)}>
                        {!notif.is_read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6366F1]" />
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor} transition-transform group-hover:scale-110`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug mb-1 ${!notif.is_read ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );

                    return notif.link ? (
                      <Link key={notif.id} href={notif.link} onClick={() => setIsOpen(false)}>
                        <Content />
                      </Link>
                    ) : (
                      <div key={notif.id}><Content /></div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
