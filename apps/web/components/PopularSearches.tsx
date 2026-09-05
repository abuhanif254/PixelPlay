import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

const popularSearches = [
  { name: "Car Racing", href: "/categories/car-games" },
  { name: "Zombies", href: "/categories/zombie-games" },
  { name: "2 Player", href: "/categories/2-player-games" },
  { name: "Stickman", href: "/categories/stickman-games" },
  { name: "Shooter Games", href: "/categories/shooting-games" },
  { name: "Unblocked Games", href: "/categories/unblocked-games" },
  { name: "Multiplayer Games", href: "/categories/multiplayer-games" },
  { name: "Puzzle Games", href: "/categories/puzzle-games" },
  { name: "Brain Teasers", href: "/categories/brain-games" },
  { name: "Escape Rooms", href: "/categories/escape-games" },
  { name: "Dress Up", href: "/categories/dress-up-games" },
  { name: "Endless Runner", href: "/categories/runner-games" },
  { name: "Strategy Games", href: "/categories/strategy-games" },
  { name: "Sports Games", href: "/categories/sports-games" },
];

export default function PopularSearches() {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <Search className="w-5 h-5 text-[#6366F1]" />
        Popular Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularSearches.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="px-4 py-2 bg-gray-100 dark:bg-[#111228] text-sm font-medium text-gray-700 dark:text-gray-300 rounded-full hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#6366F1] dark:hover:text-white transition-all border border-gray-200 dark:border-white/5 shadow-sm"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
