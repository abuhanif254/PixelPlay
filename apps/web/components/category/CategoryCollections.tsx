import React from 'react';
import Link from 'next/link';

export default function CategoryCollections() {
  const collections = [
    { title: 'Best Brain Games', games: 25, icon: '🧠', color: 'bg-pink-500/10 border-pink-500/30' },
    { title: 'Daily Puzzle Challenge', games: 18, icon: '📅', color: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Classic Puzzle Games', games: 30, icon: '🏆', color: 'bg-yellow-500/10 border-yellow-500/30' },
    { title: 'New Puzzle Games', games: 22, icon: 'NEW', color: 'bg-purple-500/10 border-purple-500/30' },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Popular Puzzle Collections</h3>
        <Link href="#" className="text-xs font-bold text-[#6366F1] hover:text-[#5457DF] transition-colors">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collections.map((collection, index) => (
          <Link key={index} href="#" className={`flex flex-col items-center justify-center p-6 rounded-2xl border bg-transparent hover:bg-white dark:hover:bg-white/5 transition-colors group cursor-pointer ${collection.color}`}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {collection.icon === 'NEW' ? (
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-black shadow-lg">NEW</div>
              ) : (
                collection.icon
              )}
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-300 text-center mb-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {collection.title}
            </h4>
            <span className="text-xs text-gray-600 dark:text-gray-500 font-medium">{collection.games} Games</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
