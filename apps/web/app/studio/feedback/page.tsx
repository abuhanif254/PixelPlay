'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Monitor,
  Smartphone,
  Clock,
  Sparkles,
  ArrowUpRight,
  Search,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';

export const runtime = 'edge';

interface BugReport {
  id: string;
  gameSlug: string;
  gameTitle: string;
  category: string;
  description: string;
  sessionDurationSec: number;
  currentScore: number;
  diagnostics: {
    viewport: string;
    dpr: number;
    isTouch: boolean;
    os: string;
    browser: string;
  };
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
}

const DEFAULT_SAMPLE_REPORTS: BugReport[] = [
  {
    id: 'rep_1726300001',
    gameSlug: 'snake',
    gameTitle: 'Neon Snake',
    category: 'controls',
    description: 'When playing in portrait on iPad mini, the right virtual gamepad D-pad tap triggers slightly above the button boundary.',
    sessionDurationSec: 145,
    currentScore: 1850,
    diagnostics: {
      viewport: '768x1024',
      dpr: 2,
      isTouch: true,
      os: 'iOS',
      browser: 'Safari',
    },
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'open',
  },
  {
    id: 'rep_1726300002',
    gameSlug: '2048',
    gameTitle: '2048 Classic',
    category: 'audio',
    description: 'Audio synthesizer clicks softly when rapid swiping 5 or more times in 1 second.',
    sessionDurationSec: 420,
    currentScore: 8192,
    diagnostics: {
      viewport: '1920x1080',
      dpr: 1,
      isTouch: false,
      os: 'Windows',
      browser: 'Chrome',
    },
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'investigating',
  },
  {
    id: 'rep_1726300003',
    gameSlug: 'flappy-bird',
    gameTitle: 'Neon Flyer',
    category: 'gameplay',
    description: 'Collision hitbox on neon pipe cap feels 2px tighter on left flank than right.',
    sessionDurationSec: 62,
    currentScore: 38,
    diagnostics: {
      viewport: '390x844',
      dpr: 3,
      isTouch: true,
      os: 'iOS',
      browser: 'Safari',
    },
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'resolved',
  },
];

export default function StudioFeedbackPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load from local storage or seed with samples
  useEffect(() => {
    try {
      const cached = localStorage.getItem('spielcade_bug_reports');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReports(parsed);
          return;
        }
      }
    } catch {}

    setReports(DEFAULT_SAMPLE_REPORTS);
  }, []);

  const handleUpdateStatus = (id: string, nextStatus: 'open' | 'investigating' | 'resolved') => {
    arcadeAudio.playSelect();
    const updated = reports.map((r) => (r.id === id ? { ...r, status: nextStatus } : r));
    setReports(updated);
    try {
      localStorage.setItem('spielcade_bug_reports', JSON.stringify(updated));
    } catch {}
  };

  const filtered = reports.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.gameTitle.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.diagnostics.os.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-gray-900 dark:text-white flex items-center gap-3">
            <Bug className="text-rose-500" size={28} />
            Player Feedback & Bug Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time player bug submissions, performance glitches, and hardware diagnostics across your games.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle size={14} />
            <span>{reports.filter((r) => r.status === 'open').length} Open Reports</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#111228] p-3 rounded-2xl border border-gray-200 dark:border-white/5 shadow-md">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search size={16} className="text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by game, description, or OS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none placeholder-gray-400 py-1.5"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="controls">Controls</option>
            <option value="loading">Black Screen</option>
            <option value="audio">Audio</option>
            <option value="gameplay">Gameplay</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 p-6">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Zero Matching Reports
            </h3>
            <p className="text-xs text-gray-500 mt-1">All player feedback and bugs for this filter are resolved.</p>
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-gray-300 dark:hover:border-white/15 transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      report.category === 'controls'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : report.category === 'loading'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : report.category === 'audio'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {report.category}
                  </span>

                  <h3 className="text-sm font-black font-outfit text-gray-900 dark:text-white">
                    {report.gameTitle}
                  </h3>

                  <Link
                    href={`/games/${report.gameSlug}`}
                    target="_blank"
                    className="text-gray-400 hover:text-indigo-400 transition-colors"
                    title="Inspect Game Page"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(report.timestamp).toLocaleDateString()} at{' '}
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Status Picker */}
                  <select
                    value={report.status}
                    onChange={(e) => handleUpdateStatus(report.id, e.target.value as any)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition-colors ${
                      report.status === 'resolved'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : report.status === 'investigating'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <option value="open">🔴 Open</option>
                    <option value="investigating">🟡 Investigating</option>
                    <option value="resolved">🟢 Resolved</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-sans">
                {report.description}
              </p>

              {/* Diagnostics telemetry pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center gap-1">
                  <Monitor size={11} />
                  <span>{report.diagnostics.os} • {report.diagnostics.browser}</span>
                </span>

                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center gap-1">
                  <Smartphone size={11} />
                  <span>{report.diagnostics.viewport} (@{report.diagnostics.dpr}x)</span>
                </span>

                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center gap-1">
                  <Clock size={11} />
                  <span>Played {report.sessionDurationSec}s</span>
                </span>

                {report.currentScore > 0 && (
                  <span className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                    Score: {report.currentScore.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
