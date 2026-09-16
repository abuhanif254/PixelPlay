import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface RelatedPostItem {
  slug: string;
  title: string;
  cover_image?: string;
  created_at?: string;
  category?: string;
  tags?: string[];
}

const FALLBACK_POSTS: RelatedPostItem[] = [
  {
    slug: 'top-10-adventure-games-2024',
    title: "Top 10 Adventure Games You Should Play",
    created_at: '2024-05-12',
    cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=150&auto=format&fit=crop',
    category: 'Guides'
  },
  {
    slug: 'beginners-guide-rpg-games',
    title: "A Beginner's Guide to RPG Games",
    created_at: '2024-05-10',
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=150&auto=format&fit=crop',
    category: 'Guides'
  },
  {
    slug: 'improve-reflexes-action-games',
    title: "How Action Games Can Improve Your Reflexes",
    created_at: '2024-05-08',
    cover_image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=150&auto=format&fit=crop',
    category: 'Tips & Tricks'
  }
];

export default function RelatedPostsWidget({ posts }: { posts?: RelatedPostItem[] }) {
  const displayPosts = (posts && posts.length > 0) ? posts : FALLBACK_POSTS;

  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Related Posts</h3>
      <div className="flex flex-col gap-5">
        {displayPosts.map((post, i) => (
          <Link key={post.slug || i} href={`/blog/${post.slug}`} className="flex gap-4 group">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-800 relative">
              <Image 
                src={post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&q=80'} 
                alt={post.title} 
                fill
                sizes="64px"
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="inline-block px-1.5 py-0.5 bg-[#6366F1]/20 text-[#6366F1] text-[9px] font-bold rounded uppercase tracking-wider w-fit mb-1">
                {post.category || (post.tags && post.tags[0]) || 'Article'}
              </span>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight group-hover:text-[#6366F1] transition-colors mb-1 line-clamp-2">
                {post.title}
              </h4>
              <span className="text-xs text-gray-500">
                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
