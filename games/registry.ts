// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run 'pnpm run generate-registry' in the games/ package to update this file.

import dynamic from 'next/dynamic';

export interface GameConfig {
  title: string;
  category: string;
  rating?: number;
  description?: string;
  image?: string;
  controls?: Record<string, string>;
}

export const gamesRegistry: Record<string, { config: GameConfig, component: any }> = {
  "snake": {
    config: {
      "title": "Neon Snake",
      "category": "Arcade",
      "rating": 4.8,
      "description": "The classic snake game, reimagined with neon graphics and smooth controls.",
      "controls": {
            "ArrowKeys": "Move Snake",
            "Space": "Pause"
      }
},
    // Note: We use ssr: false because game engines rely on the browser's window and canvas
    component: dynamic(() => import('./snake/Game').then(mod => mod.default || mod.Game || mod), { ssr: false })
  },
};
