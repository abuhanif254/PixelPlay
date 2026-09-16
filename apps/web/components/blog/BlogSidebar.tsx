'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { subscribeToNewsletter } from '@/app/newsletter/actions';

export default function BlogSidebar() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ success?: boolean; error?: string | null } | null>(null);
  const [isPending, startTransition] = useTransition();

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
      slug: 'top-10-adventure-games-2024',
      title: 'Top 10 Adventure Games You Should Play',
      date: 'May 12, 2024',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=150&auto=format&fit=crop'
    },
    {
      slug: 'beginners-guide-rpg-games',
      title: "Beginner's Guide to RPG Games",
      date: 'May 10, 2024',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=150&auto=format&fit=crop'
    },
    {
      slug: 'improve-reflexes-action-games',
      title: 'How Action Games Improve Your Reflexes',
      date: 'May 8, 2024',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=150&auto=format&fit=crop'
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      const fd = new FormData();
      fd.append('email', email);
      const res = await subscribeToNewsletter(null, fd);
      setStatus(res);
      if (res.success) {
        setEmail('');
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* Categories */}
      <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl dark:shadow-none">
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Categories</h3>
        <ul className="space-y-4">
          {categories.map((cat, i) => {
            const href = cat.name === 'All Posts' ? '/blog' : `/blog?category=${encodeURIComponent(cat.name)}`;
            return (
              <li key={i}>
                <Link 
                  href={href}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm">{cat.icon}</span>
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm font-medium">{cat.name}</span>
                  </div>
                  <span className="text-gray-500 text-xs font-bold">{cat.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex justify-center">
          <Link href="/blog" className="text-[#6366F1] hover:text-[#5457DF] text-xs font-bold flex items-center gap-1 transition-colors">
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
          {popularPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="flex gap-4 group">
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
        
        {status?.success ? (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium relative z-10 text-center">
            🎉 Thanks for subscribing! Check your inbox soon.
          </div>
        ) : (
          <form className="flex flex-col gap-3 relative z-10" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..." 
              className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm dark:shadow-none"
              required
              disabled={isPending}
            />
            {status?.error && (
              <p className="text-xs text-red-500 font-medium">{status.error}</p>
            )}
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl py-3 transition-colors shadow-lg shadow-[#6366F1]/20 disabled:opacity-50"
            >
              {isPending ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        <p className="text-xs text-gray-500 text-center mt-4 relative z-10">
          We respect your privacy.
        </p>
      </div>

    </div>
  );
}
