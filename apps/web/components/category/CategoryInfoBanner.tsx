import React from 'react';

export default function CategoryInfoBanner() {
  const benefits = [
    { icon: '🎯', text: 'Improve Memory' },
    { icon: '🧠', text: 'Boost IQ' },
    { icon: '🧘', text: 'Reduce Stress' },
    { icon: '✨', text: 'Fun & Addictive' },
  ];

  return (
    <div className="w-full bg-[#1A1B3B] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 mb-12 shadow-xl">
      
      {/* Left Text Box */}
      <div className="flex items-start gap-6 lg:w-1/2">
        <div className="w-16 h-16 shrink-0 bg-[#6366F1]/20 border border-[#6366F1]/30 rounded-2xl flex items-center justify-center text-3xl">
          🧠
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-bold font-outfit text-white mb-2">Why Play Puzzle Games?</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Puzzle games improve memory, enhance problem-solving skills, and reduce stress. Play our free online puzzle games anytime, anywhere!
          </p>
        </div>
      </div>

      {/* Right Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-1/2 mt-auto lg:mt-0">
        {benefits.map((benefit, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#111228] border border-white/5 rounded-xl p-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#6366F1]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-300">{benefit.text}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
