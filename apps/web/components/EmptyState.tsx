import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 md:py-24 text-center bg-[#0A0B1A]/50 rounded-2xl border border-white/5">
      <div className="w-20 h-20 mb-6 bg-[#111228] rounded-full flex items-center justify-center border border-white/10 shadow-lg">
        <SearchX className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-outfit">No Games Found</h3>
      <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm md:text-base">
        We couldn't find any games matching your current filters. Try adjusting your search or category to discover more amazing games.
      </p>
      <button 
        onClick={onReset}
        className="px-6 py-3 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] transition-colors shadow-lg shadow-[#6366F1]/20 active:scale-95"
      >
        Clear All Filters
      </button>
    </div>
  );
}
