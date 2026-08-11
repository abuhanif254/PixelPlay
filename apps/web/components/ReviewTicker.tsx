'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  user: string;
  game: string;
  rating: number;
  text: string;
  timeAgo: string;
}

const mockReviews: Review[] = [
  { id: '1', user: 'Player452', game: 'Ultimate Chess', rating: 5, text: 'Best chess AI I have played against.', timeAgo: '2 mins ago' },
  { id: '2', user: 'SpeedKing', game: 'Cyberpunk Racing', rating: 5, text: 'Incredible graphics for a browser game!', timeAgo: '15 mins ago' },
  { id: '3', user: 'SnakeMaster', game: 'Classic Snake', rating: 4, text: 'So nostalgic, love it.', timeAgo: '1 hour ago' },
  { id: '4', user: 'Brainiac', game: 'Sudoku Pro', rating: 5, text: 'Perfect daily brain teaser.', timeAgo: '3 hours ago' },
];

export default function ReviewTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockReviews.length);
    }, 4000); // Change review every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-black/5 dark:border-white/5 relative overflow-hidden h-40">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Live Community Reviews</h3>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute left-6 right-6"
        >
          <div className="flex items-center gap-1 mb-2 text-warning">
            {[...Array(mockReviews[currentIndex].rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-lg font-medium mb-2 dark:text-gray-200">
            "{mockReviews[currentIndex].text}"
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-primary">{mockReviews[currentIndex].user}</span> on {mockReviews[currentIndex].game} • {mockReviews[currentIndex].timeAgo}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
