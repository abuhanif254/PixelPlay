import React from 'react';
import Link from 'next/link';

export default function FeaturedArticles() {
  const mainArticle = {
    title: 'Top 10 Adventure Games You Should Play in 2024',
    description: 'Explore our handpicked list of the best adventure games that deliver epic stories and unforgettable moments.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    category: 'Guides',
    date: 'May 12, 2024',
    readTime: '5 min read',
    author: 'PlayHub Team'
  };

  const secondaryArticles = [
    {
      title: 'How to Get Better at Puzzle Games: 7 Expert Tips',
      image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=600&auto=format&fit=crop',
      category: 'Tips & Tricks',
      date: 'May 10, 2024',
      readTime: '4 min read'
    },
    {
      title: 'Upcoming Browser Games Releasing in May 2024',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
      category: 'News',
      date: 'May 8, 2024',
      readTime: '3 min read'
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold font-outfit text-white mb-6">Featured Articles</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Large Article */}
        <div className="lg:col-span-8 flex flex-col bg-[#111228] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors group relative">
          <div className="w-full aspect-video md:aspect-[16/9] relative overflow-hidden">
            <img 
              src={mainArticle.image} 
              alt={mainArticle.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay for text readability if placed over image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111228] via-[#111228]/50 to-transparent lg:hidden" />
          </div>
          
          <div className="p-6 md:p-8 flex flex-col justify-end lg:justify-start flex-1 -mt-16 relative z-10 lg:mt-0 lg:bg-transparent">
            <span className="inline-block px-3 py-1 bg-[#6366F1] text-white text-[10px] font-bold rounded uppercase tracking-wider w-fit mb-4">
              {mainArticle.category}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-[#6366F1] transition-colors">
              {mainArticle.title}
            </h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
              {mainArticle.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366F1] to-purple-600 flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <span className="text-gray-300">{mainArticle.author}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>{mainArticle.date}</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>{mainArticle.readTime}</span>
              </div>
              <button className="px-5 py-2 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-lg transition-colors">
                Read More
              </button>
            </div>
          </div>
        </div>

        {/* Right Stacked Articles */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {secondaryArticles.map((article, i) => (
            <div key={i} className="flex-1 bg-[#111228] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors group flex flex-col">
              <div className="w-full aspect-video relative overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="inline-block px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] text-[10px] font-bold rounded uppercase tracking-wider w-fit mb-3">
                  {article.category}
                </span>
                <h3 className="text-lg font-bold text-white mb-auto leading-tight group-hover:text-[#6366F1] transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-4">
                  <span>{article.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
