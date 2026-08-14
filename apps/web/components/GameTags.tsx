import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';

interface GameTagsProps {
  tags?: string[];
  category: string;
}

export default function GameTags({ tags, category }: GameTagsProps) {
  // Always include the main category as a tag for SEO internal linking
  const allTags = Array.from(new Set([category, ...(tags || [])]));

  return (
    <div id="tags" className="w-full mt-12 pt-8 border-t border-gray-200 dark:border-white/5">
      <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
        <Tag size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Related Categories & Tags</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {allTags.map((tag, idx) => (
          <Link 
            key={idx}
            href={`/games?category=${encodeURIComponent(tag)}`}
            className="px-4 py-2 bg-gray-100 dark:bg-[#111228] hover:bg-[#6366F1] dark:hover:bg-[#6366F1] border border-gray-200 dark:border-white/10 hover:border-[#6366F1] text-gray-700 dark:text-gray-300 hover:text-white rounded-full text-sm font-medium transition-all shadow-sm"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
