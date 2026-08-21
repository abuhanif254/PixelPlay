import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Generate simple textures programmatically so we don't need external images
    const graphics = this.add.graphics();
    
    // Snake body texture (neon green)
    graphics.fillStyle(0x4ADE80, 1);
    graphics.fillRoundedRect(0, 0, 20, 20, 4);
    graphics.generateTexture('body', 20, 20);
    graphics.clear();
    
    // Snake head texture (brighter green)
    graphics.fillStyle(0x22C55E, 1);
    graphics.fillRoundedRect(0, 0, 20, 20, 6);
    graphics.generateTexture('head', 20, 20);
    graphics.clear();

    // Food texture (neon red/pink)
    graphics.fillStyle(0xEF4444, 1);
    graphics.fillCircle(10, 10, 8);
    graphics.generateTexture('food', 20, 20);
    graphics.clear();

    // Particle texture
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.clear();
  }

  create() {
    this.scene.start('MainScene');
  }
}
