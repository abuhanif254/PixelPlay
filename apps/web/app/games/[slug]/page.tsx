import React from 'react';
import { notFound } from 'next/navigation';
import { gamesRegistry } from '@pixelplay/games/registry';
import { Star, Maximize2, Share2, Heart, Flag } from 'lucide-react';

interface GamePageProps {
  params: {
    slug: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  const { slug } = params;
  const game = gamesRegistry[slug];

  if (!game) {
    notFound();
  }

  const { config, component: GameComponent } = game;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {config.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
              {config.category}
            </span>
            <div className="flex items-center gap-1 text-warning font-semibold">
              <Star size={16} className="fill-current" />
              {config.rating || 'New'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white font-medium">
            <Heart size={18} />
            <span className="hidden sm:inline">Favorite</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white font-medium">
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Game Player Area */}
      <div className="w-full aspect-video md:aspect-[21/9] lg:aspect-[24/9] bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-2xl mb-8 flex items-center justify-center">
        <GameComponent />
        
        {/* Fullscreen Button Overlay */}
        <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors z-10">
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Game Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this game</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              {config.description}
            </p>
          </section>

          {config.controls && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to play</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(config.controls).map(([key, action]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{action}</span>
                    <kbd className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono font-bold shadow-sm dark:shadow-none">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Report an issue</h3>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-medium">
              <Flag size={18} />
              Report Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
