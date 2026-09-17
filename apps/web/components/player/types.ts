import React from 'react';

export type PlayerState = 'idle' | 'ad' | 'rewarded_ad' | 'playing' | 'paused' | 'game_over';
export type AspectRatio = '16:9' | '4:3' | '9:16' | 'auto';
export type CloudSaveStatus = 'idle' | 'saving' | 'saved' | 'loading' | 'loaded' | 'error';
export type GamepadMode = 'dual' | 'wasd' | 'arrows';
export type GamepadOpacity = 'low' | 'med' | 'high';

export interface RelatedGame {
  id?: string;
  slug: string;
  title: string;
  image?: string;
  category?: string;
  rating?: number;
  totalPlays?: number;
}

export interface GamePlayerProps {
  children?: React.ReactNode;
  title: string;
  slug: string;
  category?: string;
  image?: string;
  sourceUrl?: string | null;
  onGameOver?: (score: number) => Promise<any> | void;
  relatedGames?: RelatedGame[];
  gameId?: string;
  initialFavorited?: boolean;
  initialAspectRatio?: AspectRatio;
  orientation?: 'landscape' | 'portrait' | 'auto';
  challenger?: string;
  challengerScore?: number;
}

// Virtual Gamepad key mappings (WASD + Arrows simultaneously)
export const VPAD_KEY_PAIRS: Record<string, { key: string; code: string; secondaryKey?: string; secondaryCode?: string }> = {
  up: { key: 'ArrowUp', code: 'ArrowUp', secondaryKey: 'w', secondaryCode: 'KeyW' },
  down: { key: 'ArrowDown', code: 'ArrowDown', secondaryKey: 's', secondaryCode: 'KeyS' },
  left: { key: 'ArrowLeft', code: 'ArrowLeft', secondaryKey: 'a', secondaryCode: 'KeyA' },
  right: { key: 'ArrowRight', code: 'ArrowRight', secondaryKey: 'd', secondaryCode: 'KeyD' },
  a: { key: ' ', code: 'Space', secondaryKey: 'x', secondaryCode: 'KeyX' }, // Jump / Primary Action
  b: { key: 'Shift', code: 'ShiftLeft', secondaryKey: 'z', secondaryCode: 'KeyZ' }, // Run / Dash
  x: { key: 'e', code: 'KeyE', secondaryKey: 'c', secondaryCode: 'KeyC' }, // Interact / Use
  y: { key: 'q', code: 'KeyQ', secondaryKey: 'v', secondaryCode: 'KeyV' }, // Special / Switch
  space: { key: ' ', code: 'Space' },
  enter: { key: 'Enter', code: 'Enter' },
};

export const AR_CLASSES: Record<AspectRatio, string> = {
  '16:9': 'aspect-video w-full',
  '4:3': 'aspect-[4/3] w-full max-w-[840px] mx-auto',
  '9:16': 'aspect-[9/16] w-full max-w-[420px] mx-auto min-h-[440px] sm:min-h-[500px]',
  'auto': 'w-full min-h-[300px] sm:min-h-[420px] md:min-h-[540px] xl:min-h-[620px]',
};

export const SHORTCUTS = [
  { key: 'F', label: 'Fullscreen' },
  { key: 'T', label: 'Theater Mode' },
  { key: 'P', label: 'Pause / Resume' },
  { key: 'M', label: 'Mute / Unmute' },
  { key: 'R', label: 'Restart Game' },
  { key: 'Esc', label: 'Exit Fullscreen' },
  { key: '?', label: 'Keyboard Guide' },
];

export const fmtTime = (s: number): string =>
  String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
