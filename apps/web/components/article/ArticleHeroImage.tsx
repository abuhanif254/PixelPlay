import React from 'react';
import Image from 'next/image';
import { BlogPost } from '@/lib/blogData';

export default function ArticleHeroImage({ post }: { post: BlogPost }) {
  return (
    <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 relative border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
      <Image 
        src={post.coverImage} 
        alt={post.title} 
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
