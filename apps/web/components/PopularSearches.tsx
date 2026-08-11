import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

const popularTags = [
  "Multiplayer Games",
  "Car Racing",
  "Puzzle Games",
  "Strategy Games",
  ".io Games",
  "Shooter Games",
  "Dress Up",
  "Action RPG",
  "Classic Arcade",
  "Brain Teasers",
  "Zombies",
  "Sports Games",
  "Platformers",
  "Simulation"
];

export default function PopularSearches() {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        Popular Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Link 
            key={tag} 
            href={`/search?q=${encodeURIComponent(tag.toLowerCase())}`}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors border border-black/5 dark:border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
