import React from 'react';
import Image from 'next/image';

export default function ArticleHeroImage() {
  return (
    <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 relative border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
      <Image 
        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" 
        alt="The Legend of Zelda: Tears of the Kingdom landscape" 
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
