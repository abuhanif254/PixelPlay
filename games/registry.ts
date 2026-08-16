// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run 'pnpm run generate-registry' in the games/ package to update this file.

import dynamic from 'next/dynamic';

export interface GameConfig {
  title: string;
  category: string;
  rating?: number;
  description?: string;
  image?: string;
  history?: string;
  strategy?: string;
  tips?: string[];
  keyboardControls?: Record<string, string>;
  touchControls?: Record<string, string>;
  faqs?: {q: string, a: string}[];
  tags?: string[];
  screenshots?: string[];
  trailerUrl?: string;
  developer?: string;
  releaseDate?: string;
  platform?: string;
}

export const gamesRegistry: Record<string, { config: GameConfig, component: any }> = {
  "2048": {
    config: {
      "title": "2048",
      "category": "Puzzle",
      "rating": 4.9,
      "description": "Join the numbers and get to the 2048 tile! A highly addictive math puzzle game.",
      "history": "2048 was originally created by Gabriele Cirulli in March 2014. It is a sliding block puzzle game based on 1024 by Veewo Studio and similar to Threes.",
      "strategy": "Keep your highest tile in a corner. The most common strategy is to pick a corner (e.g., bottom right) and only use three directions (down, right, left) to keep the highest numbers trapped there.",
      "tips": [
            "Never swipe the direction that pulls your highest tile out of its corner.",
            "Try to build a 'snake' of descending numbers.",
            "Don't rush! Take your time to plan your moves."
      ],
      "keyboardControls": {
            "ArrowKeys": "Swipe Tiles",
            "W A S D": "Swipe Tiles (Alternative)"
      },
      "touchControls": {
            "Swipe": "Swipe Tiles"
      },
      "faqs": [
            {
                  "q": "Can I continue playing after reaching 2048?",
                  "a": "Yes! The game continues, allowing you to reach 4096, 8192, and beyond."
            },
            {
                  "q": "How is the score calculated?",
                  "a": "When two tiles merge, the value of the new tile is added to your total score."
            }
      ],
      "tags": [
            "Puzzle",
            "Math",
            "Brain",
            "Classic"
      ],
      "screenshots": [],
      "developer": "Gabriele Cirulli / Spielcade",
      "releaseDate": "August 2026",
      "platform": "Browser (Desktop, Mobile)"
},
    // Note: We use ssr: false because game engines rely on the browser's window and canvas
    component: dynamic(() => import('./2048/Game'), { ssr: false })
  },
  "snake": {
    config: {
      "title": "Neon Snake",
      "category": "Arcade",
      "rating": 4.8,
      "description": "The classic snake game, reimagined with neon graphics and smooth controls.",
      "history": "Snake is a video game genre where the player maneuvers a growing line that becomes a primary obstacle to itself. The concept originated in the 1976 arcade game Blockade, and the ease of implementing Snake has led to hundreds of versions.",
      "strategy": "Stay near the edges when the snake gets long and plan a clear exit route. Avoid trapping yourself in corners.",
      "tips": [
            "Take your time, there is no time limit.",
            "Try to move in a zig-zag pattern when running out of space."
      ],
      "keyboardControls": {
            "ArrowKeys": "Move Snake",
            "Space": "Pause"
      },
      "touchControls": {
            "Swipe Up": "Move Up",
            "Swipe Down": "Move Down",
            "Swipe Left": "Move Left",
            "Swipe Right": "Move Right"
      },
      "faqs": [
            {
                  "q": "What happens when you eat an apple?",
                  "a": "Your snake grows longer by one segment and your score increases."
            },
            {
                  "q": "Can I hit the walls?",
                  "a": "No, hitting the walls or your own tail will result in a game over."
            }
      ],
      "tags": [
            "Arcade",
            "Classic",
            "Retro",
            "Skill",
            "HTML5"
      ],
      "screenshots": [
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800"
      ],
      "trailerUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "developer": "Spielcade Studios",
      "releaseDate": "August 2026",
      "platform": "Browser (Desktop, Mobile)"
},
    // Note: We use ssr: false because game engines rely on the browser's window and canvas
    component: dynamic(() => import('./snake/Game'), { ssr: false })
  },
};
