import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Generate Hexagon Pattern Background
    const hexGraphics = this.add.graphics();
    hexGraphics.lineStyle(2, 0x1E293B, 0.4); // Dark slate blue line
    
    // Draw a single hexagon
    const hexRadius = 40;
    const width = Math.sqrt(3) * hexRadius;
    const height = 2 * hexRadius;
    
    // We'll draw a small tileable hexagon grid (2x2)
    const drawHex = (cx: number, cy: number) => {
      hexGraphics.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const px = cx + hexRadius * Math.cos(angle);
        const py = cy + hexRadius * Math.sin(angle);
        if (i === 0) hexGraphics.moveTo(px, py);
        else hexGraphics.lineTo(px, py);
      }
      hexGraphics.closePath();
      hexGraphics.strokePath();
    };

    // Draw tileable hex pattern
    const tileWidth = width * 2;
    const tileHeight = height * 1.5;
    
    drawHex(width / 2, height / 2);
    drawHex(width * 1.5, height / 2);
    drawHex(width, height * 1.25);
    drawHex(0, height * 1.25);
    drawHex(width * 2, height * 1.25);

    hexGraphics.generateTexture('bg-hex', tileWidth, tileHeight);
    hexGraphics.clear();

    // Snake Body Sphere (Radial Gradient look)
    const bodySize = 36;
    const bodyGraphics = this.add.graphics();
    // Simulate a 3D sphere by drawing overlapping circles of decreasing size and lighter color
    for (let i = 0; i < bodySize / 2; i++) {
      const alpha = 1 - (i / (bodySize / 2)) * 0.5;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x0F766E), // Dark Teal edge
        Phaser.Display.Color.ValueToColor(0x2DD4BF), // Light Teal center
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
        Phaser.Display.Color.ValueToColor(0x047857), // Darker Green edge
        Phaser.Display.Color.ValueToColor(0x10B981), // Light Green center
        headSize / 2,
        i
      );
      headGraphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), alpha);
      headGraphics.fillCircle(headSize / 2, headSize / 2, headSize / 2 - i);
    }
    
    // Eyes (White circles with black pupils)
    headGraphics.fillStyle(0xFFFFFF, 1);
    headGraphics.fillCircle(headSize * 0.3, headSize * 0.3, 8);
    headGraphics.fillStyle(0x000000, 1);
    headGraphics.fillCircle(headSize * 0.3, headSize * 0.3, 4);
    
    headGraphics.fillStyle(0xFFFFFF, 1);
    headGraphics.fillCircle(headSize * 0.7, headSize * 0.3, 8);
    headGraphics.fillStyle(0x000000, 1);
    headGraphics.fillCircle(headSize * 0.7, headSize * 0.3, 4);
    
    headGraphics.generateTexture('head', headSize, headSize);
    headGraphics.clear();

    // Food Orbs (Random bright colors)
    const foodSize = 18;
    const foodGraphics = this.add.graphics();
    foodGraphics.fillStyle(0xFFFFFF, 1);
    foodGraphics.fillCircle(foodSize / 2, foodSize / 2, foodSize / 2);
    // Outer glow
    foodGraphics.fillStyle(0xFFFFFF, 0.4);
    foodGraphics.fillCircle(foodSize / 2, foodSize / 2, foodSize / 2 + 4);
    foodGraphics.generateTexture('food-base', foodSize + 8, foodSize + 8);
    foodGraphics.clear();
  }

  create() {
    this.scene.start('MainScene');
  }
}
