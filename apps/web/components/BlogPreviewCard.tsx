
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
    <article className="group flex flex-col sm:flex-row bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-700 hover:shadow-2xl hover:shadow-accent/5">
      <div className="sm:w-2/5 aspect-video sm:aspect-auto relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <span className="text-xs uppercase tracking-widest font-semibold text-gray-500">Thumbnail</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="flex items-center space-x-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
          {category && (
            <span className="text-primary font-bold uppercase tracking-wider">{category}</span>
          )}
          <time dateTime={date}>{date}</time>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{readTime}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-black dark:text-white mb-2 leading-tight group-hover:text-accent transition-colors duration-300 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {excerpt}
        </p>
        
        <div className="mt-auto flex items-center text-sm font-semibold text-primary group-hover:text-accent transition-colors duration-300">
          <span>Read Article</span>
          <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </article>
  );

  if (slug) {
    return <Link href={`/blog/${slug}`} className="block">{content}</Link>;
  }

  return content;
}
