'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Achievement = {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  xp_reward: number;
  earned: boolean;
  earned_at: string | null;
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export default function ProfileAchievements({ achievements = [] }: { achievements: Achievement[] }) {
  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);
  const display = [...earned, ...locked].slice(0, 8);

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Achievements</h3>
          <p className="text-xs text-gray-400 mt-0.5">{earned.length} / {achievements.length} earned</p>
        </div>
        <Link href="/profile/achievements" className="text-[#6366F1] text-xs font-bold hover:underline">
          View All
        </Link>
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center gap-2">
          <span className="text-3xl">🏆</span>
          <p className="text-sm text-gray-500 dark:text-gray-400">Achievements loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {display.map((ach, i) => (
            <motion.div
              key={ach.id}
              whileHover={{ y: -6, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              title={`${ach.title}: ${ach.description}${ach.earned_at ? ` (${timeAgo(ach.earned_at)})` : ' (Locked)'}`}
              className={`flex flex-col items-center text-center cursor-pointer group ${!ach.earned ? 'opacity-40 grayscale' : ''}`}
            >
              {/* Hexagon */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 drop-shadow-lg">
                {ach.earned && (
                  <div className={`absolute inset-0 bg-gradient-to-b ${ach.gradient} opacity-30 blur-md group-hover:opacity-50 transition-opacity rounded-full`} />
                )}
                <div
                  className={`w-full h-full bg-gradient-to-br ${ach.earned ? ach.gradient : 'from-gray-400 to-gray-600'} flex items-center justify-center relative overflow-hidden`}
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                  <div
                    className="w-[90%] h-[90%] bg-gray-50 dark:bg-[#111228] flex items-center justify-center"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    <div
                      className={`w-[85%] h-[85%] bg-gradient-to-br ${ach.earned ? ach.gradient : 'from-gray-500 to-gray-700'} flex items-center justify-center`}
                      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                    >
                      <span className="text-xl">{ach.icon}</span>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">{ach.title}</h4>
              {ach.earned && ach.earned_at && (
                <p className="text-[9px] text-[#6366F1] font-semibold">{timeAgo(ach.earned_at)}</p>
              )}
              {!ach.earned && (
                <p className="text-[9px] text-gray-400">+{ach.xp_reward} XP</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
