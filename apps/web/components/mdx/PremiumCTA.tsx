import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PremiumCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export default function PremiumCTA({
  title = "Unlock Your Next Adventure",
  description = "Join Spielcade today to save your progress, unlock achievements, and climb the global leaderboards.",
  buttonText = "Sign Up Free",
  href = "/login"
}: PremiumCTAProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1C3D] to-[#0A0B1A] border border-[#6366F1]/30 p-8 my-8 shadow-2xl group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6366F1] rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#6366F1]" />
            <span className="text-[#6366F1] font-bold text-sm uppercase tracking-wider">Premium Feature</span>
          </div>
          <h3 className="text-2xl font-bold font-outfit text-white mb-2 leading-tight mt-0">
            {title}
          </h3>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto md:mx-0 mb-0">
            {description}
          </p>
        </div>
        
        <div className="shrink-0 w-full md:w-auto">
          <Link href={href} className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-8 py-4 bg-[#6366F1] hover:bg-[#5457DF] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] group/btn relative overflow-hidden no-underline">
            <span className="relative z-10">{buttonText}</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
          </Link>
        </div>
      </div>
    </div>
  );
}
