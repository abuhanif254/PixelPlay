import React from 'react';
import Link from 'next/link';

export default function TagsWidget() {
  const tags = [
    'Adventure', 'Guides', 'Top 10', 'Action', 'Open World', 'RPG', 'Story Rich', 'Single Player'
  ];

  return (
    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-white mb-6">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Link 
            key={index} 
            href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-[#6366F1] bg-transparent hover:bg-[#6366F1]/10 text-xs font-bold transition-all"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
