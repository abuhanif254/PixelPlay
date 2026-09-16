'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  ChevronUp,
  ChevronDown,
  Play,
  X,
  Sparkles,
  Users,
  Radio,
} from 'lucide-react';
import { arcadePulse, PulseEvent } from '@/lib/arcade-pulse';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function ArcadePulse() {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [onlineCount, setOnlineCount] = useState(550);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsub = arcadePulse.subscribe((newEvents, count) => {
      setEvents(newEvents);
      setOnlineCount(count);
    });
    return unsub;
  }, []);

  // Cycle current headline event every 4.5 seconds
  useEffect(() => {
    if (events.length === 0 || isExpanded) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [events.length, isExpanded]);

  if (isDismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => {
            arcadeAudio.playBlip();
            setIsDismissed(false);
          }}
          className="p-2.5 rounded-full bg-black/80 backdrop-blur-xl border border-emerald-500/40 text-emerald-400 shadow-2xl flex items-center gap-1.5 text-xs font-black hover:scale-105 transition-transform"
          title="Open Live Arcade Pulse"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{onlineCount}</span>
        </button>
      </div>
    );
  }

  const currentEvent = events[currentIndex] || events[0];

  const formatAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 30) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="fixed bottom-3 left-3 sm:left-6 z-40 max-w-sm sm:max-w-md w-auto select-none pointer-events-auto">
      {/* Expanded Drawer Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            className="mb-2 w-80 sm:w-96 rounded-3xl bg-[#111227]/95 border border-white/15 shadow-2xl backdrop-blur-2xl p-4 text-white overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Radio size={14} className="animate-pulse" />
                </span>
                <div>
                  <h3 className="text-xs font-black font-outfit uppercase tracking-wider">
                    Arcade Pulse Stream
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{onlineCount.toLocaleString()} Players Gaming Live</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Collapse stream drawer"
                className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Event List */}
            <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1">
              {events.slice(0, 12).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{evt.badgeEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-200 truncate">
                        <span className="font-bold text-white">{evt.player}</span>{' '}
                        <span className="text-gray-400">{evt.text}</span>
                      </p>
                      <span className="text-[9px] text-indigo-400 font-mono">
                        {evt.gameTitle} • {formatAgo(evt.timestamp)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/games/${evt.gameSlug}`}
                    onClick={() => arcadeAudio.playSelect()}
                    className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors shrink-0"
                    title={`Play ${evt.gameTitle}`}
                  >
                    <Play size={11} fill="currentColor" />
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill Ticker */}
      <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-full bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl text-xs text-white max-w-full">
        {/* Live Counter Badge */}
        <button
          type="button"
          onClick={() => {
            arcadeAudio.playSelect();
            setIsExpanded((p) => !p);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[10px] tracking-wider shrink-0 hover:bg-emerald-500/30 transition-colors"
          title="Click to view all live arcade milestones"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{onlineCount}</span>
        </button>

        {/* Dynamic Headline Event */}
        {currentEvent && (
          <button
            type="button"
            onClick={() => {
              arcadeAudio.playSelect();
              setIsExpanded((p) => !p);
            }}
            className="flex items-center gap-1.5 text-left min-w-0 truncate pr-1 hover:text-indigo-400 transition-colors"
          >
            <span className="shrink-0 text-xs">{currentEvent.badgeEmoji}</span>
            <span className="text-[11px] truncate text-gray-200">
              <strong className="text-white font-semibold">{currentEvent.player}</strong>{' '}
              {currentEvent.text}
            </span>
          </button>
        )}

        {/* Expand / Collapse Chevron */}
        <button
          type="button"
          onClick={() => {
            arcadeAudio.playSelect();
            setIsExpanded((p) => !p);
          }}
          aria-label={isExpanded ? 'Collapse Stream' : 'Expand Stream'}
          className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
          title={isExpanded ? 'Collapse' : 'Expand Stream'}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {/* Dismiss Pill */}
        <button
          type="button"
          onClick={() => {
            arcadeAudio.playBlip();
            setIsDismissed(true);
          }}
          aria-label="Minimize Pulse"
          className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-rose-400 transition-colors shrink-0"
          title="Minimize Pulse"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
