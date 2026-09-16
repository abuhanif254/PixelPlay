import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface NavPostItem {
  title: string;
  slug: string;
  cover_image?: string;
}

export default function PostNavigation({
  prev,
  next,
}: {
  prev?: NavPostItem | null;
  next?: NavPostItem | null;
}) {
  const prevUrl = prev ? `/blog/${prev.slug}` : '/blog';
  const prevTitle = prev?.title || 'Back to all articles';
  const prevImage = prev?.cover_image || 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=150&auto=format&fit=crop';

  const nextUrl = next ? `/blog/${next.slug}` : '/blog';
  const nextTitle = next?.title || 'Browse more articles';
  const nextImage = next?.cover_image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=150&auto=format&fit=crop';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-b border-gray-200 dark:border-white/5 mb-10">
      
      {/* Previous Post */}
      <Link href={prevUrl} className="w-full sm:w-1/2 flex items-center gap-4 group hover:bg-gray-100 dark:hover:bg-[#111228] p-3 rounded-xl transition-colors">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-800">
          <img 
            src={prevImage} 
            alt={prevTitle} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[#6366F1] text-xs font-bold flex items-center gap-1 mb-1">
            <ArrowLeft size={12} />
            {prev ? 'Previous Post' : 'Back to Blog'}
          </span>
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors line-clamp-1">
            {prevTitle}
          </span>
        </div>
      </Link>

      {/* Divider on desktop */}
      <div className="hidden sm:block w-px h-12 bg-gray-200 dark:bg-white/5" />

      {/* Next Post */}
      <Link href={nextUrl} className="w-full sm:w-1/2 flex items-center justify-end gap-4 group hover:bg-gray-100 dark:hover:bg-[#111228] p-3 rounded-xl transition-colors text-right">
        <div className="flex flex-col items-end">
          <span className="text-[#6366F1] text-xs font-bold flex items-center justify-end gap-1 mb-1">
            {next ? 'Next Post' : 'Discover More'}
            <ArrowRight size={12} />
          </span>
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors line-clamp-1">
            {nextTitle}
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-800">
          <img 
            src={nextImage} 
            alt={nextTitle} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        </div>
      </Link>

    </div>
  );
}
