'use client';

import React from 'react';
import Link from 'next/link';

export default function BlogSidebar() {
  const categories = [
    { name: 'All Posts', count: 128, icon: '🗂️' },
    { name: 'Guides', count: 42, icon: '📘' },
    { name: 'Tips & Tricks', count: 28, icon: '💡' },
    { name: 'News', count: 24, icon: '📰' },
    { name: 'Game Reviews', count: 18, icon: '⭐' },
    { name: 'Walkthroughs', count: 10, icon: '🎮' },
    { name: 'Updates', count: 6, icon: '🔄' },
  ];

  const popularPosts = [
    {
      title: 'Top 10 Puzzle Games to Train Your Brain',
      date: 'May 9, 2024',
      image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=150&auto=format&fit=crop'
    },
    {
      title: "Beginner's Guide to Strategy Games",
      date: 'May 7, 2024',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=150&auto=format&fit=crop'
    },
    {
      title: 'Best Multiplayer Games to Play with Friends',
      date: 'May 5, 2024',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=150&auto=format&fit=crop'
    },
    {
      title: 'How to Improve Your Gaming Skills',
      date: 'May 3, 2024',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=150&auto=format&fit=crop'
    },
    {
      title: 'The History of Classic Arcade Games',
      date: 'May 1, 2024',
      image: 'https://images.unsplash.com/photo-1518929468119-e5bf444c30f4?q=80&w=150&auto=format&fit=crop'
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* Categories */}
      <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl dark:shadow-none">
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Categories</h3>
        <ul className="space-y-4">
          {categories.map((cat, i) => (
            <li key={i}>
              <Link 
                href={`/blog/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm">{cat.icon}</span>
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm font-medium">{cat.name}</span>
                </div>
                <span className="text-gray-500 text-xs font-bold">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center">
          <Link href="/blog/categories" className="text-[#6366F1] hover:text-[#5457DF] text-xs font-bold flex items-center gap-1 transition-colors">
            View All Categories
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Popular Posts */}
      <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl dark:shadow-none">
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Popular Posts</h3>
        <div className="flex flex-col gap-5">
          {popularPosts.map((post, i) => (
            <Link key={i} href="#" className="flex gap-4 group">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight group-hover:text-[#6366F1] transition-colors mb-1 line-clamp-2">
                  {post.title}
                </h4>
                <span className="text-xs text-gray-500">{post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl dark:shadow-none relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366F1]/10 blur-[50px] rounded-full pointer-events-none" />
        
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-3 relative z-10">Subscribe to Newsletter</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed relative z-10">
          Get the latest gaming news, tips and updates straight to your inbox.
        </p>
        
        <form className="flex flex-col gap-3 relative z-10" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email..." 
            className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm dark:shadow-none"
            required
          />
          <button 
            type="submit"
            className="w-full bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl py-3 transition-colors shadow-lg shadow-[#6366F1]/20"
          >
            Subscribe
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4 relative z-10">
          We respect your privacy.
        </p>
      </div>

    </div>
  );
}
