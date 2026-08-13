import React from 'react';

export default function LatestArticles() {
  const tabs = ['All', 'Guides', 'Tips & Tricks', 'News', 'Reviews', 'Walkthroughs'];

  const articles = [
    {
      title: "Beginner's Guide to RPG Games",
      description: "New to RPG games? This guide will help you understand the basics and get you started on your journey.",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400&auto=format&fit=crop",
      category: "Guides",
      date: "May 11, 2024",
      readTime: "6 min read"
    },
    {
      title: "7 Tips to Improve Your Reflexes in Action Games",
      description: "Fast reflexes can make a huge difference. Here are 7 proven tips to help you react faster and win more.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop",
      category: "Tips & Tricks",
      date: "May 9, 2024",
      readTime: "5 min read"
    },
    {
      title: "New Sandbox Games You Should Try in 2024",
      description: "Check out the most exciting sandbox games that let you build, create, and explore without limits.",
      image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=400&auto=format&fit=crop",
      category: "News",
      date: "May 7, 2024",
      readTime: "4 min read"
    },
    {
      title: "Review: Need for Speed Unbound – Is It Worth It?",
      description: "We review Need for Speed Unbound and break down the gameplay, graphics, and overall experience.",
      image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=400&auto=format&fit=crop",
      category: "Reviews",
      date: "May 6, 2024",
      readTime: "6 min read"
    }
  ];

  return (
    <div>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold font-outfit text-white">Latest Articles</h2>
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab, i) => (
            <button 
              key={i} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                i === 0 
                ? 'bg-[#6366F1] text-white' 
                : 'bg-transparent border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {articles.map((article, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[#111228] border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors group">
            {/* Image */}
            <div className="w-full sm:w-64 aspect-video sm:aspect-auto sm:h-36 shrink-0 rounded-xl overflow-hidden relative">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center flex-1 py-1">
              <span className="inline-block px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] text-[10px] font-bold rounded uppercase tracking-wider w-fit mb-2">
                {article.category}
              </span>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#6366F1] transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 max-w-2xl">
                {article.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <span>{article.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>{article.readTime}</span>
                </div>
                <button className="px-4 py-1.5 bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1] hover:text-white text-xs font-bold rounded-lg transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {[1, 2, 3, 4].map((num) => (
          <button 
            key={num} 
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
              num === 1 
              ? 'bg-[#6366F1] text-white' 
              : 'bg-[#111228] border border-white/5 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            {num}
          </button>
        ))}
        <span className="text-gray-500 px-1">...</span>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold bg-[#111228] border border-white/5 text-gray-400 hover:text-white hover:border-white/20">
          11
        </button>
        <button className="h-8 px-4 flex items-center justify-center gap-1 rounded-lg text-sm font-bold bg-[#111228] border border-white/5 text-gray-400 hover:text-white hover:border-white/20 ml-2">
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}
