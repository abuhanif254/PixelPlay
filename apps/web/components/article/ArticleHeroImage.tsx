import React from 'react';
import Image from 'next/image';
export default function ArticleHeroImage({ post }: { post: any }) {
  return (
    <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 relative border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
      <Image 
        src={post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80'} 
        alt={post.title} 
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
