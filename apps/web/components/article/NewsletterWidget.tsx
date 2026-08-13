'use client';
import React from 'react';

export default function NewsletterWidget() {
  return (
    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
      <h3 className="text-xl font-bold font-outfit text-white mb-3">Newsletter</h3>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        Get the latest gaming news, guides, and exclusive updates straight to your inbox.
      </p>
      
      <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <input 
          type="email" 
          placeholder="Enter your email..." 
          className="w-full bg-[#0A0B1A] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-gray-600"
          required
        />
        <button 
          type="submit"
          className="w-full bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl py-3 transition-colors"
        >
          Subscribe
        </button>
      </form>
      <p className="text-xs text-gray-600 text-center mt-4">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
