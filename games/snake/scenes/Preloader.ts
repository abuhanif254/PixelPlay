import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // We will generate the textures programmatically so no external assets are needed.
    
    // Background Grid Pattern (hex or simple grid)
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(2, 0x1E293B, 0.4);
    // Draw a 100x100 tile
    gridGraphics.strokeRect(0, 0, 100, 100);
    gridGraphics.generateTexture('bg-grid', 100, 100);
    gridGraphics.clear();

    // Snake Body Sphere (Radial Gradient look)
    const bodySize = 36;
    const bodyGraphics = this.add.graphics();
    // Simulate a 3D sphere by drawing overlapping circles of decreasing size and lighter color
    for (let i = 0; i < bodySize / 2; i++) {
      const alpha = 1 - (i / (bodySize / 2)) * 0.5;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x16A34A), // Dark Green edge
        Phaser.Display.Color.ValueToColor(0x4ADE80), // Light Green center
        bodySize / 2,
        i
      );
      bodyGraphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), alpha);
      bodyGraphics.fillCircle(bodySize / 2, bodySize / 2, bodySize / 2 - i);
    }
    bodyGraphics.generateTexture('body', bodySize, bodySize);
    bodyGraphics.clear();

    // Snake Head with Eyes
    const headSize = 42;
    const headGraphics = this.add.graphics();
    for (let i = 0; i < headSize / 2; i++) {
      const alpha = 1 - (i / (headSize / 2)) * 0.5;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x15803D), // Darker Green edge
        Phaser.Display.Color.ValueToColor(0x22C55E), // Light Green center
        headSize / 2,
        i
      );
      headGraphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), alpha);
      headGraphics.fillCircle(headSize / 2, headSize / 2, headSize / 2 - i);
    }
    
    // Eyes (White circles with black pupils)
    // Left eye
    headGraphics.fillStyle(0xFFFFFF, 1);
    headGraphics.fillCircle(headSize * 0.3, headSize * 0.3, 7);
    headGraphics.fillStyle(0x000000, 1);
    headGraphics.fillCircle(headSize * 0.3, headSize * 0.3, 3);
    
    // Right eye
    headGraphics.fillStyle(0xFFFFFF, 1);
    headGraphics.fillCircle(headSize * 0.7, headSize * 0.3, 7);
    headGraphics.fillStyle(0x000000, 1);
    headGraphics.fillCircle(headSize * 0.7, headSize * 0.3, 3);
    
    headGraphics.generateTexture('head', headSize, headSize);
    headGraphics.clear();

    // Food Orbs (Random bright colors)
    const foodSize = 16;
    const foodGraphics = this.add.graphics();
    foodGraphics.fillStyle(0xFFFFFF, 1);
    foodGraphics.fillCircle(foodSize / 2, foodSize / 2, foodSize / 2);
    foodGraphics.generateTexture('food-base', foodSize, foodSize);
    foodGraphics.clear();
  }

  create() {
    this.scene.start('MainScene');
  }
}
