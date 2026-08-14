'use client';
import React, { useEffect, useState } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Gamepad2, Puzzle, Target, Swords, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const data = [
  { subject: 'Puzzle', A: 90, fullMark: 100 },
  { subject: 'Strategy', A: 60, fullMark: 100 },
  { subject: 'Action', A: 100, fullMark: 100 },
  { subject: 'Arcade', A: 120, fullMark: 100 },
  { subject: 'Board', A: 50, fullMark: 100 },
  { subject: 'Card', A: 40, fullMark: 100 },
];

export default function ProfileStats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const progressStats = [
    { name: 'Puzzle', value: 45, icon: Puzzle },
    { name: 'Strategy', value: 30, icon: Target },
    { name: 'Action', value: 50, icon: Swords },
    { name: 'Arcade', value: 60, icon: Gamepad2 },
    { name: 'Board', value: 25, icon: Zap },
    { name: 'Card', value: 20, icon: Zap },
  ];

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-sm hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] dark:hover:border-[#6366F1]/50"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Game Stats</h3>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        
        {/* Radar Chart */}
        <div className="flex-1 min-h-[250px] relative flex items-center justify-center">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#ffffff1a" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111228', borderColor: '#ffffff1a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#8B5CF6', fontWeight: 'bold' }}
                />
                <Radar
                  name="Player"
                  dataKey="A"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Progress Bars */}
        <div className="flex-1 flex flex-col justify-center gap-3">
          {progressStats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <stat.icon className="w-4 h-4 text-gray-500 shrink-0" />
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-300 w-16">{stat.name}</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#0A0B1A] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{stat.value}%</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
