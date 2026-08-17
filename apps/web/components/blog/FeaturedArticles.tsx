import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts } from '@/lib/blogData';

export default function FeaturedArticles({ posts }: { posts: any[] }) {
  // Use first post as main article, next two as secondary if they exist
  const mainPost = posts.length > 0 ? posts[0] : null;
  const secondaryPosts = posts.slice(1, 3);

  if (!mainPost) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Featured Articles</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Large Article */}
        <Link href={`/blog/${mainPost.slug}`} className="lg:col-span-8 flex flex-col bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-white/10 transition-colors group relative shadow-sm dark:shadow-none">
          <div className="w-full aspect-video md:aspect-[16/9] relative overflow-hidden">
            <Image 
              src={mainPost.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80'} 
              alt={mainPost.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay for text readability if placed over image */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 dark:from-[#111228] dark:via-[#111228]/50 to-transparent lg:hidden" />
          </div>
          
          <div className="p-6 md:p-8 flex flex-col justify-end lg:justify-start flex-1 -mt-16 relative z-10 lg:mt-0 lg:bg-transparent">
            <span className="inline-block px-3 py-1 bg-[#6366F1] text-white text-[10px] font-bold rounded uppercase tracking-wider w-fit mb-4">
              FEATURED
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-[#6366F1] transition-colors">
              {mainPost.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-6 line-clamp-2">
              {mainPost.excerpt}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366F1] to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    {mainPost.author_avatar ? <img src={mainPost.author_avatar} className="w-full h-full object-cover" /> : mainPost.author.charAt(0)}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{mainPost.author}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span>{new Date(mainPost.created_at).toLocaleDateString()}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span>{mainPost.read_time || 5} min read</span>
              </div>
              <button className="px-5 py-2 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-lg transition-colors">
                Read More
              </button>
            </div>
          </div>
        </Link>

        {/* Right Stacked Articles */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {secondaryPosts.map((article, i) => (
            <Link href={`/blog/${article.slug}`} key={article.slug} className="flex-1 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-white/10 transition-colors group flex flex-col shadow-sm dark:shadow-none">
              <div className="w-full aspect-video relative overflow-hidden">
                <Image 
                  src={article.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80'} 
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="inline-block px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] text-[10px] font-bold rounded uppercase tracking-wider w-fit mb-3">
                  ARTICLE
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-auto leading-tight group-hover:text-[#6366F1] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-4">
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span>{article.read_time || 5} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
