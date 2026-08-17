'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function HomeSEOText() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <div 
        className={`prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-[140px] md:max-h-[120px]'}`}
      >
        <h2 className="text-2xl font-bold mb-4">The Ultimate Destination for Free Online Games & Game Developers</h2>
        <p>
          Welcome to <strong>Spielcade</strong>, the world's premier platform for both playing free browser games online and publishing your own HTML5 creations. Whether you are a player looking for heart-pounding action and brain-teasing puzzles, or a developer looking to monetize your hard work, our ecosystem is built for you. We believe that gaming should be accessible to all, which is why every title on Spielcade is completely free to play, requiring absolutely no downloads or installations.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="text-xl font-bold mb-3">For Players: Play Instantly</h3>
            <p className="mb-4">
              Our games are built using the latest HTML5 technology, ensuring flawless performance across desktops, tablets, and mobile devices. Start a game on your PC during your lunch break and seamlessly continue playing on your smartphone during your commute.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Action & Adventure:</strong> Dive into epic quests and explore vast worlds.</li>
              <li><strong>Puzzle & Logic:</strong> Challenge your mind with intricate brain teasers.</li>
              <li><strong>Multiplayer (.io):</strong> Compete globally in real-time arenas.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">For Developers: Publish & Earn</h3>
            <p className="mb-4">
              Are you a game developer? Spielcade provides a seamless portal to publish your self-hosted HTML5 games to a massive audience. Join our Developer Program and start earning revenue based on the views and engagement your games generate.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Zero Friction:</strong> Upload your game or link your self-hosted iframe instantly.</li>
              <li><strong>Monetization:</strong> Earn real money from our built-in ad revenue sharing model.</li>
              <li><strong>Analytics:</strong> Track your player count, ratings, and daily earnings in real-time.</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Expand/Collapse Button */}
      <div className={`flex justify-center mt-4 ${!isExpanded ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 dark:from-gray-800/50 pt-16 pb-2' : ''}`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-[#111221] border border-gray-200 dark:border-white/10 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/50 transition-all shadow-sm"
        >
          {isExpanded ? (
            <>Read Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Read More <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
