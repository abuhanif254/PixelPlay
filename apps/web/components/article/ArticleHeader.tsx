import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import LikeButton from './LikeButton';

interface ArticleHeaderProps {
  post: any;
  likeCount?: number;
  hasLiked?: boolean;
}

export default function ArticleHeader({ post, likeCount = 0, hasLiked = false }: ArticleHeaderProps) {
  const formattedDate = new Date(post.created_at || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
        <Link href="/" className="hover:text-[#6366F1] transition-colors">Home</Link>
        <span>›</span>
        <Link href="/blog" className="hover:text-[#6366F1] transition-colors">Blog</Link>
        <span>›</span>
        <span className="text-[#6366F1]">{post.title}</span>
      </nav>

      <div className="flex flex-col gap-4">
        {/* Category Pill - Mocked for now */}
        <span className="inline-block px-3 py-1 bg-[#6366F1]/20 text-[#6366F1] text-xs font-bold rounded uppercase tracking-wider w-fit">
          ARTICLE
        </span>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold font-outfit text-gray-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      {/* Meta Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        
        {/* Author & Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white font-bold overflow-hidden">
              {post.author_avatar ? (
                <img src={post.author_avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                post.author?.charAt(0) || 'S'
              )}
            </div>
            <span className="text-gray-900 dark:text-white font-bold">{post.author || 'Spielcade Team'}</span>
            <span className="text-blue-500 text-xs">✔</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 hidden sm:block" />
          <span>{formattedDate}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 hidden sm:block" />
          <span>{post.read_time || 5} min read</span>
        </div>

        {/* Social Share & Likes */}
        <div className="flex flex-wrap items-center gap-4">
          <LikeButton postId={post.id} initialCount={likeCount} initialLiked={hasLiked} />
          
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 hidden sm:block" />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium mr-1 hidden sm:inline">Share:</span>
            <button className="w-9 h-9 rounded-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:bg-[#6366F1] hover:border-[#6366F1] transition-all shadow-sm dark:shadow-none">
              <Facebook size={16} />
            </button>
            <button className="w-9 h-9 rounded-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-all shadow-sm dark:shadow-none">
              <Twitter size={16} />
            </button>
            <button className="w-9 h-9 rounded-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all shadow-sm dark:shadow-none">
              {/* WhatsApp Icon placeholder */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/20 hover:border-gray-300 dark:hover:border-white/30 transition-all shadow-sm dark:shadow-none">
              <LinkIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
