import React from 'react';
import { CategoryData } from '@/lib/mockCategories';

export default function CategoryInfoBanner({ category }: { category: CategoryData }) {
  return (
    <div className="w-full bg-[#111228] border border-white/5 rounded-2xl p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div 
        className="absolute -right-20 -top-20 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-20"
        style={{ backgroundColor: category.color }}
      />
      
      <div className="flex-1 z-10">
        <h3 className="text-2xl font-bold font-outfit text-white mb-3">
          Why Play <span style={{ color: category.color }}>{category.title}</span>?
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          {category.description} Play instantly in your browser, no downloads required. Whether you have 5 minutes or 5 hours, we have the perfect {category.title.toLowerCase()} for you.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: `${category.color}1A`, color: category.color }}>
              🧠
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Brain Training</h4>
              <p className="text-xs text-gray-500">Improve cognitive skills</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: `${category.color}1A`, color: category.color }}>
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Play</h4>
              <p className="text-xs text-gray-500">No downloads needed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex shrink-0 z-10">
        <div className="w-32 h-32 relative">
          <div className="absolute inset-0 border-4 border-dashed rounded-full animate-spin-slow opacity-30" style={{ borderColor: category.color }} />
          <div className="absolute inset-2 border border-solid rounded-full opacity-20" style={{ borderColor: category.color }} />
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            {category.icon}
          </div>
        </div>
      </div>
      
    </div>
  );
}
