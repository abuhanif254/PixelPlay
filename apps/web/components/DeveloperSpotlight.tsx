'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Sparkles, DollarSign, BarChart3, Globe2 } from 'lucide-react';

export default function DeveloperSpotlight() {
  return (
    <div className="bg-gradient-to-r from-[#0C0D26] via-[#121334] to-[#0A0B1A] text-white rounded-3xl overflow-hidden relative group border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-500 shadow-2xl">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-700" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-[90px] pointer-events-none group-hover:bg-blue-500/25 transition-colors duration-700" />

      <div className="relative z-10 p-8 md:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Copy & CTA */}
        <div className="lg:col-span-8 flex flex-col justify-center max-w-2xl">
          <div className="flex items-center gap-2 text-purple-400 font-bold mb-4 uppercase tracking-widest text-xs">
            <Code2 className="w-4 h-4" />
            <span>Developer Partner Program</span>
          </div>
          
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-tight leading-tight">
            Build, Publish & Monetize Your HTML5 Games
          </h3>
          <p className="text-gray-300 mb-8 text-sm md:text-base leading-relaxed">
            Reach 500,000+ passionate browser gamers worldwide. Upload your self-hosted iframe or WebGL bundle in under 60 seconds and start earning transparent revenue from day one.
          </p>
          
          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
              <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-xs sm:text-sm text-white">70% Ad Share</div>
                <div className="text-[11px] text-gray-400">Industry-leading payout</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
              <BarChart3 className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <div className="font-bold text-xs sm:text-sm text-white">Live Analytics</div>
                <div className="text-[11px] text-gray-400">Track plays & earnings</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
              <Globe2 className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-xs sm:text-sm text-white">Global Edge CDN</div>
                <div className="text-[11px] text-gray-400">Sub-50ms loading</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/studio" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#EC4899] text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
            >
              <span>Submit Your Game</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              href="/studio/docs" 
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-3.5 rounded-full font-bold text-sm sm:text-base hover:scale-105 transition-all duration-300"
            >
              Developer SDK Docs
            </Link>
          </div>
        </div>

        {/* Right Column: Mini Metric Graphic */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-full max-w-xs rounded-2xl bg-black/40 border border-white/10 p-6 backdrop-blur-md shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Developer Metrics</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            
            <div>
              <span className="text-2xl font-extrabold text-white font-mono">$12,450+</span>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">Paid to Creators This Month</p>
            </div>

            <div>
              <span className="text-2xl font-extrabold text-white font-mono">1.2M+</span>
              <p className="text-xs text-purple-300 font-semibold mt-0.5">Monthly Game Plays</p>
            </div>

            <div className="pt-2">
              <div className="text-[11px] text-gray-400 leading-relaxed">
                Zero approval waitlist for verified HTML5 developers. Instant deployment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
