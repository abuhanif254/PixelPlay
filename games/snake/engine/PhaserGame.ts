import Phaser from 'phaser';
import { Preloader } from '../scenes/Preloader';
import { MainScene } from '../scenes/MainScene';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  parent: 'game-container',
  backgroundColor: '#0F172A',
  pixelArt: false,
  scene: [
    Preloader,
    MainScene
  ]
};

export const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};
