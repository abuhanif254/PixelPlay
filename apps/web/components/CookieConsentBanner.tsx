'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, ChevronRight, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getStoredConsent, saveConsent, ConsentPreferences } from '@/lib/consent';

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Preference states
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(true);

  useEffect(() => {
    setMounted(true);
    const existing = getStoredConsent();

    if (!existing) {
      // First-time visitor: display compact banner
      setIsOpen(true);
      setIsCustomizing(false);
    } else {
      // Load previous preferences for customize view
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
      setIsAgeConfirmed(existing.isAgeConfirmed);
    }

    // Listen for custom event triggered anywhere (e.g. footer "Cookie Preferences")
    const handleOpenModal = () => {
      const current = getStoredConsent();
      if (current) {
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
        setIsAgeConfirmed(current.isAgeConfirmed);
      }
      setIsCustomizing(true);
      setIsOpen(true);
    };

    window.addEventListener('spielcade:open_consent_modal', handleOpenModal);
    return () => {
      window.removeEventListener('spielcade:open_consent_modal', handleOpenModal);
    };
  }, []);

  // When under 13 is indicated, automatically force marketing and analytics off
  const handleAgeToggle = (checked: boolean) => {
    setIsAgeConfirmed(checked);
    if (!checked) {
      setAnalytics(false);
      setMarketing(false);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      analytics: true,
      marketing: true,
      isAgeConfirmed: true,
    });
    setIsOpen(false);
    setIsCustomizing(false);
  };

  const handleEssentialOnly = () => {
    saveConsent({
      analytics: false,
      marketing: false,
      isAgeConfirmed: false,
    });
    setIsOpen(false);
    setIsCustomizing(false);
  };

  const handleSavePreferences = () => {
    saveConsent({
      analytics: isAgeConfirmed ? analytics : false,
      marketing: isAgeConfirmed ? marketing : false,
      isAgeConfirmed,
    });
    setIsOpen(false);
    setIsCustomizing(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and Age Compliance Banner"
      aria-modal={isCustomizing ? 'true' : 'false'}
      className={`fixed z-50 transition-all duration-300 pointer-events-auto ${
        isCustomizing
          ? 'inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
          : 'bottom-4 right-4 left-4 sm:left-auto sm:max-w-md'
      }`}
    >
      {/* Container */}
      <div
        className={`bg-white dark:bg-[#0D0E24] border border-indigo-500/30 dark:border-white/10 rounded-2xl shadow-2xl relative overflow-hidden text-slate-900 dark:text-white transition-all ${
          isCustomizing ? 'w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto' : 'p-4 sm:p-5'
        }`}
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Compact View */}
        {!isCustomizing ? (
          <div>
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                <Cookie size={20} />
              </div>

              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold font-outfit text-slate-900 dark:text-white">
                    Privacy & Age Compliance
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    COPPA / GDPR
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We use cookies for essential gameplay (saves, scores, security) and, with your consent, analytics and non-intrusive ads.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEssentialOnly}
                aria-label="Close and use essential only"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3.5">
              By selecting &quot;Accept All&quot;, you confirm you are 13 or older (COPPA compliant). Read our{' '}
              <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/cookies" className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80">
                Cookie Policy
              </Link>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 min-w-[120px] py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all text-center cursor-pointer"
              >
                Accept All (13+)
              </button>

              <button
                type="button"
                onClick={handleEssentialOnly}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Essential Only
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className="py-2 px-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Settings size={13} />
                <span>Customize</span>
              </button>
            </div>
          </div>
        ) : (
          /* Detailed Customization Modal */
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white">
                    Cookie & Privacy Preferences
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    GDPR Art. 7 & COPPA Safe Harbor Compliant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* COPPA Age Certification Gating */}
            <div className="p-3.5 rounded-xl bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAgeConfirmed}
                  onChange={(e) => handleAgeToggle(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/20 dark:bg-white/10"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Age Certification: I confirm I am 13 years of age or older
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    (or 16+ in EEA/UK). If unchecked, all marketing, ad profiling, and analytics are legally blocked.
                  </p>
                </div>
              </label>

              {!isAgeConfirmed && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg mt-1">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Children&apos;s Safety Mode active. Behavioral tracking and personalized ads are locked OFF.</span>
                </div>
              )}
            </div>

            {/* Granular Toggles */}
            <div className="space-y-3">
              {/* Category 1: Essential */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Strictly Essential</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Lock size={10} /> Required
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Required for high score saving, anti-cheat tokens, cloud saves, and platform security.
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded bg-emerald-500/10">
                    Always Active
                  </span>
                </div>
              </div>

              {/* Category 2: Analytics */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Analytics & Performance</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Measures anonymous FPS latency, crash logs, and game popularity to optimize speed.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={analytics && isAgeConfirmed}
                    disabled={!isAgeConfirmed}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-40" />
                </label>
              </div>

              {/* Category 3: Marketing / Ads */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Advertising & Personalization</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Enables verified sponsors and contextual ads that keep our 17,000+ games free to play.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={marketing && isAgeConfirmed}
                    disabled={!isAgeConfirmed}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-40" />
                </label>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 w-full sm:w-auto justify-center sm:justify-start">
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                <span>•</span>
                <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Reject All
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  Save My Choices
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
