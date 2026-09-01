
import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface BlogPreviewCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  imageUrl?: string;
  slug?: string;
  category?: string;
}

export default function BlogPreviewCard({ title, excerpt, date, readTime, imageUrl, slug, category }: BlogPreviewCardProps) {
  const content = (
    <article className="group flex flex-col sm:flex-row bg-white dark:bg-[#111228]/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all duration-300 hover:border-[#6366F1]/50 hover:shadow-[0_12px_35px_rgba(99,102,241,0.15)] h-full">
      <div className="sm:w-2/5 aspect-video sm:aspect-auto relative overflow-hidden bg-gray-100 dark:bg-[#0A0B1A] shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#0A0B1A]">
            <span className="text-xs uppercase tracking-widest font-semibold text-gray-400">Guide</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
          {category && (
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider">
              {category}
            </span>
          )}
          <time dateTime={date} className="text-[11px]">{date}</time>
          <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
          <div className="flex items-center text-[11px]">
            <Clock className="w-3 h-3 mr-1 text-gray-400" />
            <span>{readTime}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-[#6366F1] transition-colors duration-300 line-clamp-2 font-outfit">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
        
        <div className="mt-auto flex items-center text-sm font-bold text-[#6366F1] group-hover:text-[#818CF8] transition-colors duration-300">
          <span>Read Article</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </article>
  );

  if (slug) {
    return <Link href={`/blog/${slug}`} className="block">{content}</Link>;
  }

  return content;
}
