import React from 'react';

export default function ArticleContent() {
  const games = [
    {
      id: 1,
      title: 'The Legend of Zelda: Tears of the Kingdom',
      rating: '4.9/5',
      description: 'An epic open-world adventure that takes exploration and freedom to a whole new level.',
      tags: ['Open World', 'Action', 'Adventure', 'Single Player'],
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'God of War Ragnarök',
      rating: '4.8/5',
      description: 'A stunning narrative-driven adventure with intense combat and emotional storytelling.',
      tags: ['Action', 'Adventure', 'Story Rich', 'Single Player'],
      image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Uncharted: Legacy of Thieves Collection',
      rating: '4.7/5',
      description: 'Experience the thrill of treasure hunting in this remastered adventure classic.',
      tags: ['Adventure', 'Action', 'Third Person', 'Single Player'],
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop'
    }
  ];

  return (
    <article className="prose prose-invert max-w-none prose-headings:font-outfit prose-headings:font-bold prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-[#6366F1] hover:prose-a:text-[#5457DF] mb-12">
      
      <h2 id="section-1" className="text-2xl md:text-3xl text-white mt-0 mb-4">1. What Makes a Great Adventure Game?</h2>
      <p className="mb-10 text-base md:text-lg">
        Adventure games are all about exploration, storytelling, and immersive experiences. A great adventure game combines a compelling story, memorable characters, challenging puzzles, and a beautifully crafted world.
      </p>

      <h2 id="section-2" className="text-2xl md:text-3xl text-white mb-6">2. Our Top 10 Adventure Games for 2024</h2>
      
      <div className="flex flex-col gap-6 not-prose mb-10">
        {games.map((game) => (
          <div key={game.id} className="flex flex-col sm:flex-row gap-6 p-1 bg-transparent">
            
            {/* Image Box */}
            <div className="w-full sm:w-64 aspect-video sm:h-40 shrink-0 rounded-2xl overflow-hidden relative shadow-lg">
              {/* Number Badge */}
              <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-bold text-sm z-10 shadow-md">
                {game.id}
              </div>
              <img 
                src={game.image} 
                alt={game.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Box */}
            <div className="flex flex-col justify-center flex-1 py-1">
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                {game.title}
              </h3>
              
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-4 h-4 ${star <= 4 ? 'text-[#6366F1]' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm font-bold text-gray-300 ml-2">{game.rating}</span>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {game.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {game.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full border border-white/10 text-gray-400 text-[11px] font-bold uppercase tracking-wider bg-transparent">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
          </div>
        ))}
      </div>

    </article>
  );
}
