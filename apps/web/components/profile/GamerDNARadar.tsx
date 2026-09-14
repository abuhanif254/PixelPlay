'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, Zap, Brain, Target, Shield, Swords } from 'lucide-react';

interface GamerDNARadarProps {
  level?: number;
  xp?: number;
  streak?: number;
  achievementsCount?: number;
  uniqueGames?: number;
}

export default function GamerDNARadar({
  level = 1,
  xp = 0,
  streak = 1,
  achievementsCount = 0,
  uniqueGames = 0,
}: GamerDNARadarProps) {
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  // Compute 5-axis DNA attributes (clamped 25 - 98)
  const stats = [
    {
      id: 'speed',
      label: 'Speed & Reflex',
      icon: Zap,
      val: Math.min(98, Math.max(30, 40 + (level % 10) * 5 + (uniqueGames % 5) * 4)),
      color: '#6366F1',
      desc: 'Action APM, high-speed reaction time & evasion',
    },
    {
      id: 'logic',
      label: 'Logic & IQ',
      icon: Brain,
      val: Math.min(98, Math.max(30, 35 + (achievementsCount * 8) + (level * 2))),
      color: '#38BDF8',
      desc: 'Spatial puzzles, tactical planning & pattern recognition',
    },
    {
      id: 'precision',
      label: 'Precision',
      icon: Target,
      val: Math.min(98, Math.max(30, 45 + ((xp % 1000) / 40))),
      color: '#EC4899',
      desc: 'Aim stability, trajectory calculation & hit accuracy',
    },
    {
      id: 'endurance',
      label: 'Endurance',
      icon: Shield,
      val: Math.min(98, Math.max(30, 30 + Math.min(60, streak * 12))),
      color: '#F59E0B',
      desc: 'Daily commitment, marathon stamina & resilience',
    },
    {
      id: 'duelist',
      label: 'Duelist',
      icon: Swords,
      val: Math.min(98, Math.max(30, 38 + (level * 3) + (streak * 2))),
      color: '#F43F5E',
      desc: 'Multiplayer Party grit, clutch combat & tournament APM',
    },
  ];

  // Determine dominant archetype
  const highest = [...stats].sort((a, b) => b.val - a.val)[0];
  const archetypeMap: Record<string, string> = {
    speed: '⚡ Apex Speedster',
    logic: '🧠 Grandmaster Strategist',
    precision: '🎯 Deadeye Marksman',
    endurance: '🛡️ Iron Will Veteran',
    duelist: '⚔️ Arena Gladiator',
  };
  const archetype = archetypeMap[highest.id] || '🎮 Versatile Arcade Master';

  // Radar geometry calculations (center at 150, 150, radius 100)
  const cx = 160;
  const cy = 160;
  const maxR = 105;
  const numAxes = 5;

  const getCoordinates = (index: number, valueRatio: number) => {
    // 0 index at top (-PI / 2)
    const angle = (index * (2 * Math.PI / numAxes)) - (Math.PI / 2);
    const r = maxR * valueRatio;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Polygon points
  const polygonPoints = stats
    .map((s, i) => {
      const { x, y } = getCoordinates(i, s.val / 100);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white dark:bg-[#111228]/90 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Dna size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Gamer DNA Profile</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Play style analysis & radar attributes</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-black">
          {archetype}
        </div>
      </div>

      {/* Radar SVG and Stat Legend */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Radar Chart */}
        <div className="md:col-span-7 flex items-center justify-center relative">
          <svg width="320" height="320" viewBox="0 0 320 320" className="overflow-visible">
            <defs>
              <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#EC4899" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.55" />
              </linearGradient>
            </defs>

            {/* Concentric Web Rings (20%, 40%, 60%, 80%, 100%) */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((levelRatio) => {
              const ringPoints = Array.from({ length: numAxes })
                .map((_, i) => {
                  const { x, y } = getCoordinates(i, levelRatio);
                  return `${x},${y}`;
                })
                .join(' ');
              return (
                <polygon
                  key={levelRatio}
                  points={ringPoints}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={levelRatio === 1.0 ? 0.25 : 0.1}
                  className="text-slate-500"
                  strokeWidth="1"
                  strokeDasharray={levelRatio < 1.0 ? '3,3' : undefined}
                />
              );
            })}

            {/* Axis Spokes */}
            {stats.map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  className="text-slate-500"
                  strokeWidth="1"
                />
              );
            })}

            {/* Player DNA Polygon */}
            <motion.polygon
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              points={polygonPoints}
              fill="url(#dnaGrad)"
              stroke="#6366F1"
              strokeWidth="2.5"
              className="filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            />

            {/* Vertex Nodes & Interactive Markers */}
            {stats.map((stat, i) => {
              const { x, y } = getCoordinates(i, stat.val / 100);
              const isHovered = hoveredAxis === stat.id;
              return (
                <g
                  key={stat.id}
                  onMouseEnter={() => setHoveredAxis(stat.id)}
                  onMouseLeave={() => setHoveredAxis(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 5}
                    fill={stat.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend & Breakdown List */}
        <div className="md:col-span-5 flex flex-col gap-2.5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isHovered = hoveredAxis === stat.id;
            return (
              <div
                key={stat.id}
                onMouseEnter={() => setHoveredAxis(stat.id)}
                onMouseLeave={() => setHoveredAxis(null)}
                className={`flex flex-col gap-1 p-2.5 rounded-2xl transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-indigo-500/10 border border-indigo-500/30 translate-x-1'
                    : 'bg-slate-100/60 dark:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Icon size={14} style={{ color: stat.color }} />
                    <span>{stat.label}</span>
                  </div>
                  <span className="font-mono" style={{ color: stat.color }}>
                    {stat.val} / 100
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stat.val}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
