'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const SnakeGame = dynamic(() => import('@spielcade/games/snake/Game'), { ssr: false });
const Game2048 = dynamic(() => import('@spielcade/games/2048/Game'), { ssr: false });
const FlappyBirdGame = dynamic(() => import('@spielcade/games/flappy-bird/Game'), { ssr: false });

interface LocalGameWrapperProps {
  slug: string;
}

export default function LocalGameWrapper({ slug }: LocalGameWrapperProps) {
  switch (slug) {
    case 'snake':
      return <SnakeGame />;
    case '2048':
      return <Game2048 />;
    case 'flappy-bird':
      return <FlappyBirdGame />;
    default:
      return null;
  }
}
