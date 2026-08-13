import React from 'react';
import Link from 'next/link';

export default function ArticleCTA() {
  return (
    <div className="w-full bg-[#1A1B3B] border border-[#6366F1]/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 overflow-hidden relative">
      {/* Glow effect */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#6366F1]/20 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
        <div className="w-16 h-16 shrink-0 bg-[#6366F1] rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          {/* Controller icon */}
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.9 8.9c-.3-1.6-1.5-2.9-3.2-3.1-2.2-.2-4.4-.3-6.7-.3s-4.5.1-6.7.3C3.6 6 2.4 7.3 2.1 8.9c-.2 1.3-.4 2.6-.4 4.1 0 1.5.2 2.8.4 4.1.3 1.6 1.5 2.9 3.2 3.1 1 .1 1.9.1 2.9.2l1.3-2.1H14.5l1.3 2.1c1-.1 1.9-.1 2.9-.2 1.7-.2 2.9-1.5 3.2-3.1.2-1.3.4-2.6.4-4.1 0-1.5-.2-2.8-.4-4.1zM8 14H6v-2H4v-2h2V8h2v2h2v2H8v2zm7-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm2-3c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm2 3c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h4 className="text-xl font-bold font-outfit text-white mb-1">Love Adventure Games?</h4>
          <p className="text-gray-400 text-sm">Browse more than 500+ games in our collection.</p>
        </div>
      </div>

      <Link 
        href="/games"
        className="relative z-10 w-full md:w-auto px-6 py-3 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
      >
        Explore Games
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}
