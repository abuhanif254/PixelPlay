import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function NewsletterBanner() {
  return (
    <div className="bg-[#111228]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 mt-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 shrink-0 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center border border-[#6366F1]/20">
          <Gamepad2 className="w-8 h-8 text-[#6366F1]" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Stay Updated with New Games!</h3>
          <p className="text-sm text-gray-400">Get notified whenever we add new games to our collection.</p>
        </div>
      </div>
      
      <div className="w-full md:w-auto flex-1 max-w-md">
        <form className="relative flex items-center">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full bg-[#0A0B1A] border border-white/10 rounded-xl py-3 pl-4 pr-32 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 placeholder:text-gray-600 transition-all"
            required
          />
          <button 
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-[#6366F1]/25"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
