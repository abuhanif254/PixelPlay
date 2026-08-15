'use client';
import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

type CategoryStat = { name: string; count: number; percent: number };

export default function ProfileStats({ categoryStats = [] }: { categoryStats: CategoryStat[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const radarData = categoryStats.length > 0
    ? categoryStats.map(c => ({ subject: c.name, A: c.percent, fullMark: 100 }))
    : [
        { subject: 'Arcade',   A: 0, fullMark: 100 },
        { subject: 'Puzzle',   A: 0, fullMark: 100 },
        { subject: 'Action',   A: 0, fullMark: 100 },
        { subject: 'Strategy', A: 0, fullMark: 100 },
        { subject: 'Board',    A: 0, fullMark: 100 },
        { subject: 'Card',     A: 0, fullMark: 100 },
      ];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-sm hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)]"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Game Stats</h3>

      {categoryStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center gap-2">
          <span className="text-3xl">📊</span>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Play games to see your stats</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 flex-1">
          {/* Radar Chart */}
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#ffffff1a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111228', borderColor: '#ffffff1a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(v: any) => [`${v}%`, 'Share']}
                  />
                  <Radar name="You" dataKey="A" stroke="#8B5CF6" strokeWidth={2} fill="#8B5CF6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Progress Bars */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            {categoryStats.map((stat, idx) => (
              <div key={stat.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-300 w-16 shrink-0">{stat.name}</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#0A0B1A] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-full"
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{stat.count} plays</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
