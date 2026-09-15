'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const SnakeGame = dynamic(() => import('@spielcade/games/snake/Game'), { ssr: false });
const Game2048 = dynamic(() => import('@spielcade/games/2048/Game'), { ssr: false });
const FlappyBirdGame = dynamic(() => import('@spielcade/games/flappy-bird/Game'), { ssr: false });

interface LocalGameWrapperProps {
  slug: string;
  onGameOver?: (score: number) => void;
}

export default function LocalGameWrapper({ slug, onGameOver }: LocalGameWrapperProps) {
  const handleGameOver = (score: number) => {
    if (typeof window !== 'undefined') {
      window.postMessage({
        source: 'SPIELCADE_SDK',
        type: 'SUBMIT_SCORE',
        payload: { score }
      }, '*');
    }
    if (onGameOver) {
      onGameOver(score);
    }
  };

  switch (slug) {
    case 'snake':
      return <SnakeGame onGameOver={handleGameOver} />;
    case '2048':
      return <Game2048 onGameOver={handleGameOver} />;
    case 'flappy-bird':
      return <FlappyBirdGame onGameOver={handleGameOver} />;
    default:
      return null;
  }
}
