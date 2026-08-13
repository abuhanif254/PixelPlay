import React from 'react';

export default function ArticleHeroImage() {
  return (
    <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 relative border border-white/5">
      <img 
        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" 
        alt="The Legend of Zelda: Tears of the Kingdom landscape" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
