'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  CheckCircle,
  Monitor,
  Smartphone,
  Cpu,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';
import { submitBugReport } from '@/app/contact/actions';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameSlug: string;
  gameTitle: string;
  sessionDurationSec: number;
  currentScore?: number | null;
}

export type IssueCategory = 'loading' | 'controls' | 'audio' | 'gameplay' | 'feedback';

export default function BugReportModal({
  isOpen,
  onClose,
  gameSlug,
  gameTitle,
  sessionDurationSec,
  currentScore,
}: BugReportModalProps) {
  const [category, setCategory] = useState<IssueCategory>('controls');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Client diagnostic metadata
  const [diagnostics, setDiagnostics] = useState<{
    viewport: string;
    dpr: number;
    isTouch: boolean;
    os: string;
    browser: string;
  }>({
    viewport: 'Unknown',
    dpr: 1,
    isTouch: false,
    os: 'Unknown',
    browser: 'Unknown',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    let detectedOs = 'Desktop';
    if (/android/i.test(ua)) detectedOs = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) detectedOs = 'iOS';
    else if (/windows/i.test(ua)) detectedOs = 'Windows';
    else if (/macintosh/i.test(ua)) detectedOs = 'macOS';
    else if (/linux/i.test(ua)) detectedOs = 'Linux';

    let detectedBrowser = 'Chrome';
    if (/firefox/i.test(ua)) detectedBrowser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) detectedBrowser = 'Safari';
    else if (/edg/i.test(ua)) detectedBrowser = 'Edge';

    setDiagnostics({
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio || 1,
      isTouch: 'ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0),
      os: detectedOs,
      browser: detectedBrowser,
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    arcadeAudio.playSelect();

    const report = {
      id: `rep_${Date.now()}`,
      gameSlug,
      gameTitle,
      category,
      description: description.trim(),
      sessionDurationSec,
      currentScore: currentScore || 0,
      diagnostics,
      timestamp: new Date().toISOString(),
      status: 'open',
    };

    // Store in localStorage for instant offline access
    try {
      const existing = localStorage.getItem('spielcade_bug_reports');
      const reports = existing ? JSON.parse(existing) : [];
      reports.unshift(report);
      localStorage.setItem('spielcade_bug_reports', JSON.stringify(reports));
    } catch {}

    // Dispatch real telemetry to Supabase contact_messages
    try {
      await submitBugReport({
        gameSlug,
        gameTitle,
        category,
        description: description.trim(),
        sessionDurationSec,
        currentScore: currentScore || 0,
        diagnostics,
      });
    } catch (err) {
      console.warn('Telemetry dispatch error:', err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    arcadeAudio.playVictory();
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          <div className="py-12 flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-black font-outfit text-gray-900 dark:text-white">
              Report Transmitted!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              Your technical diagnostics and feedback have been dispatched to the developer of <strong className="text-gray-200">{gameTitle}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-black font-outfit text-gray-900 dark:text-white">
                  Report an Issue with {gameTitle}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Help the creator diagnose and fix bugs with attached telemetry.
                </p>
              </div>
            </div>

            {/* Category Chips */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                What went wrong?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'controls', label: '🎮 Controls' },
                  { id: 'loading', label: '⬛ Black Screen' },
                  { id: 'audio', label: '🔇 Audio Glitch' },
                  { id: 'gameplay', label: '⚡ Freezes / Bug' },
                  { id: 'feedback', label: '💡 Idea / Other' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as IssueCategory)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                      category === item.id
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/30'
                        : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Details input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                placeholder="Explain what happened, what buttons you pressed, or steps to reproduce..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Diagnostics Telemetry Strip */}
            <div className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] text-gray-500 dark:text-gray-400 space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span>Device / OS:</span>
                <strong className="text-gray-700 dark:text-gray-300">{diagnostics.os} • {diagnostics.browser}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Viewport Resolution:</span>
                <strong className="text-gray-700 dark:text-gray-300">{diagnostics.viewport} (@{diagnostics.dpr}x)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Touchscreen Enabled:</span>
                <strong className="text-gray-700 dark:text-gray-300">{diagnostics.isTouch ? 'Yes (Mobile/Tablet)' : 'No (Desktop Mouse)'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Duration:</span>
                <strong className="text-gray-700 dark:text-gray-300">{sessionDurationSec}s</strong>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-all active:scale-95"
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Sending Telemetry...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
