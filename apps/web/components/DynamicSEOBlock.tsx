import React from 'react';

const SEO_CONTENT: Record<string, { title: string, text: string }> = {
  'All Games': {
    title: 'Play Free Online Games on PixelPlay',
    text: 'Welcome to PixelPlay, your ultimate destination for free online browser games. Whether you are looking for action-packed adventures, mind-bending puzzles, or casual games to pass the time, we have something for everyone. Our games are playable on desktop, tablet, and mobile devices without any downloads or installations required.'
  },
  'Puzzle': {
    title: 'Free Online Puzzle Games',
    text: 'Challenge your brain with our collection of the best free online puzzle games. From classic logic puzzles like Sudoku and 2048 to modern physics-based challenges, puzzle games are the perfect way to test your problem-solving skills while having fun.'
  },
  'Action': {
    title: 'Free Online Action Games',
    text: 'Get your adrenaline pumping with our free online action games. Jump into intense battles, perform incredible stunts, and test your reflexes. Whether you prefer shooters, platformers, or fighting games, our action category has the high-paced gameplay you crave.'
  },
  'Racing': {
    title: 'Free Online Racing Games',
    text: 'Start your engines and drift into our collection of free online racing games. Drive sports cars, motorcycles, and extreme vehicles across diverse tracks. Compete against the clock or other players to prove you are the fastest racer on PixelPlay.'
  }
};

export default function DynamicSEOBlock({ category }: { category: string }) {
  const content = SEO_CONTENT[category] || {
    title: `Free Online ${category} Games`,
    text: `Discover the best free online ${category.toLowerCase()} games on PixelPlay. Play directly in your browser with no downloads required. Enjoy hours of fun with top-rated ${category.toLowerCase()} titles.`
  };

  return (
    <div className="mt-16 mb-8 p-8 rounded-2xl bg-[#0A0B1A] border border-white/5 shadow-inner">
      <h2 className="text-2xl font-bold text-white mb-4">{content.title}</h2>
      <p className="text-gray-400 leading-relaxed text-sm md:text-base">
        {content.text}
      </p>
    </div>
  );
}
