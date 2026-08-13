import React from 'react';
import Link from 'next/link';

export default function RelatedPostsWidget() {
  const posts = [
    {
      title: "Beginner's Guide to RPG Games",
      date: 'May 11, 2024',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=150&auto=format&fit=crop',
      category: 'Guides'
    },
    {
      title: "7 Tips to Improve Your Reflexes in Action Games",
      date: 'May 9, 2024',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=150&auto=format&fit=crop',
      category: 'Tips & Tricks'
    },
    {
      title: "Upcoming Browser Games Releasing in May 2024",
      date: 'May 8, 2024',
      image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=150&auto=format&fit=crop',
      category: 'News'
    },
    {
      title: "Review: Star Wars Jedi Survivor – Is It Worth Playing?",
      date: 'May 6, 2024',
      image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=150&auto=format&fit=crop',
      category: 'Reviews'
    }
  ];

  return (
    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-white mb-6">Related Posts</h3>
      <div className="flex flex-col gap-5">
        {posts.map((post, i) => (
          <Link key={i} href="#" className="flex gap-4 group">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-800">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="inline-block px-1.5 py-0.5 bg-[#6366F1]/20 text-[#6366F1] text-[9px] font-bold rounded uppercase tracking-wider w-fit mb-1">
                {post.category}
              </span>
              <h4 className="text-sm font-bold text-gray-300 leading-tight group-hover:text-[#6366F1] transition-colors mb-1 line-clamp-2">
                {post.title}
              </h4>
              <span className="text-xs text-gray-500">{post.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
