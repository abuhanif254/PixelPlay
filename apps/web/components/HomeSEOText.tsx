import React from 'react';

export default function HomeSEOText() {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80">
      <h2 className="text-2xl font-bold mb-4">The Ultimate Destination for Free Online Games</h2>
      <p>
        Welcome to <strong>PixelPlay</strong>, the world's premier platform for playing free browser games online. Whether you are looking for heart-pounding action, brain-teasing puzzles, or immersive multiplayer experiences, our extensive catalog has something for everyone. We believe that gaming should be accessible to all, which is why every title on PixelPlay is completely free to play, requiring absolutely no downloads, installations, or complicated setups.
      </p>
      
      <h3 className="text-xl font-bold mt-8 mb-3">Play Instantly Across All Devices</h3>
      <p>
        Our games are built using the latest HTML5 technology, ensuring flawless performance across desktops, tablets, and mobile devices. Start a game on your PC during your lunch break and seamlessly continue playing on your smartphone during your commute. The PixelPlay ecosystem is designed to adapt to your screen size and device capabilities, providing an optimal gaming experience wherever you are.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="text-xl font-bold mb-3">Popular Game Genres</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Action & Adventure:</strong> Dive into epic quests, battle fierce enemies, and explore vast worlds.</li>
            <li><strong>Puzzle & Logic:</strong> Challenge your mind with intricate puzzles and strategic brain teasers.</li>
            <li><strong>Multiplayer (.io):</strong> Compete against thousands of real players globally in real-time arenas.</li>
            <li><strong>Racing & Sports:</strong> Experience high-speed thrills and realistic sports simulations.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3">Why Choose PixelPlay?</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>No Downloads:</strong> Click and play instantly in your browser.</li>
            <li><strong>100% Free:</strong> Enjoy our massive library without spending a dime.</li>
            <li><strong>Safe & Secure:</strong> Curated content suitable for players of all ages.</li>
            <li><strong>Daily Updates:</strong> New games are added every single day by top developers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
