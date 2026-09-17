import React from 'react';

export interface PaginationSkeletonProps {
  className?: string;
}

export default function PaginationSkeleton({ className = '' }: PaginationSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading page results"
      aria-busy="true"
      className={`flex items-center justify-center mt-10 mb-6 w-full select-none ${className}`}
    >
      {/* Desktop Pagination Skeleton (>= 640px) */}
      <div className="hidden sm:flex items-center space-x-1.5 animate-pulse">
        {/* Previous Button Placeholder */}
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />

        {/* Numbered Pill Placeholders */}
        <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30" />
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />

        {/* Ellipsis Placeholder */}
        <div className="w-7 h-9 flex items-center justify-center text-gray-300 dark:text-gray-600 font-bold text-xs tracking-widest">
          ...
        </div>

        {/* Last Page Placeholder */}
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />

        {/* Next Button Placeholder */}
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />
      </div>

      {/* Mobile Compact Pagination Skeleton (< 640px) */}
      <div className="flex sm:hidden items-center justify-between w-full max-w-sm px-3 animate-pulse">
        {/* Previous Button Placeholder */}
        <div className="w-24 h-10 rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />

        {/* Page Counter Placeholder */}
        <div className="w-24 h-5 rounded-full bg-gray-200 dark:bg-white/5" />

        {/* Next Button Placeholder */}
        <div className="w-24 h-10 rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5" />
      </div>
    </div>
  );
}
