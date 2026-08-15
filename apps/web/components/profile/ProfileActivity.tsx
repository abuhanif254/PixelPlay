'use client';
import React from 'react';
import Link from 'next/link';
import { Gamepad2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

type Score = {
  id: string;
  score: number;
  created_at: string;
  games?: { title: string; slug: string } | null;
};

type EarnedAchievement = {
  id: string;
  title: string;
  icon: string;
  earned_at: string | null;
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function ProfileActivity({
  scores = [],
  earnedAchievements = [],
}: {
  scores?: Score[];
  earnedAchievements?: EarnedAchievement[];
}) {
  // Merge scores and achievements into a unified timeline
  type FeedItem = {
    id: string;
    type: 'score' | 'achievement';
    title: string;
    subtitle: string;
    time: string;
    timestamp: Date;
    icon: typeof Gamepad2 | null;
    emoji: string;
    iconColor: string;
    iconBg: string;
  };

  const scoreItems: FeedItem[] = scores.slice(0, 10).map(s => ({
    id: s.id,
    type: 'score',
    title: s.games?.title || 'Unknown Game',
    subtitle: `${s.score.toLocaleString()} points`,
    time: timeAgo(s.created_at),
    timestamp: new Date(s.created_at),
    icon: Gamepad2,
    emoji: '',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/15',
  }));

  const achievementItems: FeedItem[] = earnedAchievements
    .filter(a => a.earned_at)
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      type: 'achievement',
      title: `Earned: ${a.title}`,
      subtitle: 'Achievement unlocked',
      time: timeAgo(a.earned_at!),
      timestamp: new Date(a.earned_at!),
      icon: null,
      emoji: a.icon,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-500/15',
    }));

  const allItems = [...scoreItems, ...achievementItems]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Feed</h3>
        <Link href="/profile/activity" className="text-[#6366F1] text-xs font-bold hover:underline">
          View All
        </Link>
      </div>

      {allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-10 text-center gap-2">
          <span className="text-3xl">🎮</span>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No activity yet</p>
          <Link href="/games" className="text-xs text-[#6366F1] font-bold hover:underline">
            Play a game to get started →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {allItems.map((item, i) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-3 last:border-0 last:pb-0"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                {item.icon ? (
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                ) : (
                  <span className="text-base">{item.emoji}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{item.time}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
