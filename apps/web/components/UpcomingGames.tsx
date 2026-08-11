'use client';

import { Calendar, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const upcomingGames = [
  { title: 'Neon Riders 2', date: 'Oct 2026', genre: 'Racing', hype: 95 },
  { title: 'Galactic Defense', date: 'Nov 2026', genre: 'Tower Defense', hype: 88 },
  { title: 'Wordle Master', date: 'Dec 2026', genre: 'Puzzle', hype: 72 },
];

export default function UpcomingGames() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-black/5 dark:border-white/5">
      <h3 className="font-outfit text-xl font-bold mb-6 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-primary" /> Coming Soon
      </h3>
      <div className="space-y-4">
        {upcomingGames.map((game, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div>
              <h4 className="font-bold group-hover:text-primary transition-colors">{game.title}</h4>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {game.genre} • Expected {game.date}
              </div>
            </div>
            <button className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-primary hover:text-white transition-colors" title="Notify me">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
