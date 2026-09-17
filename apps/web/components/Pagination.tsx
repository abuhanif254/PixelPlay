import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PaginationSkeleton from './PaginationSkeleton';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  getPageUrl?: (page: number) => string;
  onPageChange?: (page: number) => void;
  scrollToTop?: boolean | number;
  className?: string;
  ariaLabel?: string;
}

import { getPaginationWindow } from '@/lib/pagination';

export { getPaginationWindow };

export default function Pagination({
  currentPage,
  totalPages,
  isLoading = false,
  getPageUrl,
  onPageChange,
  scrollToTop = 400,
  className = '',
  ariaLabel = 'Catalog pagination',
}: PaginationProps) {
  // 1. Zero-CLS Skeleton Mode: If loading, keep exact dimensions with animated placeholders
  if (isLoading) {
    return <PaginationSkeleton className={className} />;
  }

  // 2. Hide pagination if only 1 page exists
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPaginationWindow(currentPage, totalPages);

  const handlePageClick = (page: number, e?: React.MouseEvent) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      if (e) e.preventDefault();
      return;
    }

    if (onPageChange) {
      onPageChange(page);
    }

    if (scrollToTop !== false && typeof window !== 'undefined') {
      const topOffset = typeof scrollToTop === 'number' ? scrollToTop : 400;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={`flex items-center justify-center mt-10 mb-6 w-full ${className}`}
    >
      {/* ─── Desktop View (>= 640px) ─── */}
      <div className="hidden sm:flex items-center space-x-1.5">
        {/* Previous Button */}
        {getPageUrl ? (
          <Link
            href={getPageUrl(prevPage)}
            onClick={(e) => {
              if (prevDisabled) {
                e.preventDefault();
              } else {
                handlePageClick(prevPage, e);
              }
            }}
            rel="prev"
            aria-label="Previous Page"
            aria-disabled={prevDisabled}
            className={`w-9 h-9 rounded-lg bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all ${
              prevDisabled
                ? 'opacity-40 pointer-events-none text-gray-400 dark:text-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => handlePageClick(prevPage, e)}
            disabled={prevDisabled}
            aria-label="Previous Page"
            className={`w-9 h-9 rounded-lg bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all ${
              prevDisabled
                ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Numbered Pills & Ellipses */}
        {pages.map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;

          return getPageUrl ? (
            <Link
              key={`page-${page}`}
              href={getPageUrl(page as number)}
              onClick={(e) => handlePageClick(page as number, e)}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${page}`}
              className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border-none'
                  : 'bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95'
              }`}
            >
              {page}
            </Link>
          ) : (
            <button
              key={`page-${page}`}
              type="button"
              onClick={(e) => handlePageClick(page as number, e)}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${page}`}
              className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border-none'
                  : 'bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        {getPageUrl ? (
          <Link
            href={getPageUrl(nextPage)}
            onClick={(e) => {
              if (nextDisabled) {
                e.preventDefault();
              } else {
                handlePageClick(nextPage, e);
              }
            }}
            rel="next"
            aria-label="Next Page"
            aria-disabled={nextDisabled}
            className={`w-9 h-9 rounded-lg bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all ${
              nextDisabled
                ? 'opacity-40 pointer-events-none text-gray-400 dark:text-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => handlePageClick(nextPage, e)}
            disabled={nextDisabled}
            aria-label="Next Page"
            className={`w-9 h-9 rounded-lg bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all ${
              nextDisabled
                ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ─── Mobile Compact View (< 640px) ─── */}
      <div className="flex sm:hidden items-center justify-between w-full max-w-sm px-3">
        {/* Previous Button */}
        {getPageUrl ? (
          <Link
            href={getPageUrl(prevPage)}
            onClick={(e) => {
              if (prevDisabled) {
                e.preventDefault();
              } else {
                handlePageClick(prevPage, e);
              }
            }}
            rel="prev"
            aria-label="Previous Page"
            aria-disabled={prevDisabled}
            className={`px-3.5 py-2 rounded-xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-xs font-bold flex items-center gap-1.5 transition-all ${
              prevDisabled
                ? 'opacity-40 pointer-events-none text-gray-400 dark:text-gray-600'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => handlePageClick(prevPage, e)}
            disabled={prevDisabled}
            aria-label="Previous Page"
            className={`px-3.5 py-2 rounded-xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-xs font-bold flex items-center gap-1.5 transition-all ${
              prevDisabled
                ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
        )}

        {/* Page Counter Indicator */}
        <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-medium text-gray-600 dark:text-gray-300 select-none">
          Page{' '}
          <span className="font-bold text-[#6366F1] dark:text-indigo-400">
            {currentPage}
          </span>{' '}
          of{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {totalPages}
          </span>
        </div>

        {/* Next Button */}
        {getPageUrl ? (
          <Link
            href={getPageUrl(nextPage)}
            onClick={(e) => {
              if (nextDisabled) {
                e.preventDefault();
              } else {
                handlePageClick(nextPage, e);
              }
            }}
            rel="next"
            aria-label="Next Page"
            aria-disabled={nextDisabled}
            className={`px-3.5 py-2 rounded-xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-xs font-bold flex items-center gap-1.5 transition-all ${
              nextDisabled
                ? 'opacity-40 pointer-events-none text-gray-400 dark:text-gray-600'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95 shadow-sm'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => handlePageClick(nextPage, e)}
            disabled={nextDisabled}
            aria-label="Next Page"
            className={`px-3.5 py-2 rounded-xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 text-xs font-bold flex items-center gap-1.5 transition-all ${
              nextDisabled
                ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 active:scale-95 shadow-sm'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </nav>
  );
}
