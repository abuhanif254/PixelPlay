import Phaser from 'phaser';
import { Preloader } from '../scenes/Preloader';
import { MainScene } from '../scenes/MainScene';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0F172A',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [
    Preloader,
    MainScene
  ]
};

export const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};
