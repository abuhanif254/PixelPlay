import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blogData';

export default function LatestArticles({ posts }: { posts: any[] }) {
  const tabs = ['All', 'Guides', 'Tips & Tricks', 'News', 'Reviews', 'Walkthroughs'];

  // Skip the first 3 posts as they are featured
  const articles = posts.slice(3);

  return (
    <div>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">Latest Articles</h2>
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab, i) => (
            <button 
              key={i} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                i === 0 
                ? 'bg-[#6366F1] text-white' 
                : 'bg-transparent border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {articles.length > 0 ? articles.map((article, i) => (
          <Link href={`/blog/${article.slug}`} key={article.slug} className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 p-4 rounded-2xl hover:border-gray-300 dark:hover:border-white/10 shadow-sm dark:shadow-none transition-colors group">
            {/* Image */}
            <div className="w-full sm:w-64 aspect-video sm:aspect-auto sm:h-36 shrink-0 rounded-xl overflow-hidden relative">
              <Image 
                src={article.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80'} 
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center flex-1 py-1">
              <span className="inline-block px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] text-[10px] font-bold rounded uppercase tracking-wider w-fit mb-2">
                ARTICLE
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-[#6366F1] transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 max-w-2xl">
                {article.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span>{article.read_time || 5} min read</span>
                </div>
                <button className="px-4 py-1.5 bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1] hover:text-white text-xs font-bold rounded-lg transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </Link>
        )) : (
          <div className="py-12 text-center text-gray-500">More articles coming soon!</div>
        )}
      </div>

    </div>
  );
}
