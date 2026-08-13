import React from 'react';
import { Search } from 'lucide-react';

export default function BlogHero() {
  const topics = ['Guides', 'Tips & Tricks', 'News', 'Reviews', 'Walkthroughs'];

  return (
    <div className="relative w-full rounded-[2rem] bg-gradient-to-br from-[#1A1B3B] to-[#0A0B1A] border border-white/5 overflow-hidden mb-12">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366F1]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59E0B]/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:p-16 relative z-10">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 mb-8 md:mb-0">
          <div className="inline-block px-3 py-1 bg-[#6366F1]/20 border border-[#6366F1]/30 text-[#6366F1] text-xs font-bold rounded-lg w-fit tracking-wider">
            BLOG & GUIDES
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-outfit text-white leading-tight">
            Game On, Stay <br />
            Informed 🎮
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed">
            Tips, guides, news and strategies to level up your gaming experience.
          </p>

          {/* Search Bar */}
          <div className="relative flex items-center mt-2 max-w-md">
            <div className="absolute left-4 text-gray-500">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search blog articles..." 
              className="w-full bg-[#111228] border border-white/10 text-white text-sm rounded-xl py-3.5 pl-12 pr-24 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-gray-500"
            />
            <button className="absolute right-2 px-4 py-1.5 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-lg transition-colors">
              Search
            </button>
          </div>

          {/* Popular Topics */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Popular Topics:</span>
            {topics.map((topic, i) => (
              <button 
                key={i} 
                className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded-full border border-white/10 hover:border-[#6366F1] bg-transparent hover:bg-[#6366F1]/10 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Right 3D Illustration */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          {/* For production, replace with the specific generated 3D image */}
          <img 
            src="https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=800&auto=format&fit=crop" 
            alt="Gaming Controller" 
            className="w-full max-w-[400px] lg:max-w-[500px] object-contain drop-shadow-[0_0_50px_rgba(99,102,241,0.3)] mix-blend-screen"
            style={{ filter: 'hue-rotate(270deg) saturate(1.5)' }} 
          />
        </div>

      </div>
    </div>
  );
}
