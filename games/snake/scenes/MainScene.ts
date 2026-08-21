import { Scene } from 'phaser';
import { EventBus } from '../engine/EventBus';

const GRID_SIZE = 20;

export class MainScene extends Scene {
  private snake!: Phaser.GameObjects.Image[];
  private food!: Phaser.GameObjects.Image;
  private direction!: Phaser.Math.Vector2;
  private nextDirection!: Phaser.Math.Vector2;
  private moveTimer!: Phaser.Time.TimerEvent;
  private isGameOver = false;
  private score = 0;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('MainScene');
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.snake = [];
    this.direction = new Phaser.Math.Vector2(0, -1);
    this.nextDirection = new Phaser.Math.Vector2(0, -1);
    
    // Background
    this.cameras.main.setBackgroundColor('#0F172A');
    
    // Grid Lines (Aesthetics)
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1E293B, 0.5);
    for (let i = 0; i <= 20; i++) {
      graphics.moveTo(i * GRID_SIZE, 0);
      graphics.lineTo(i * GRID_SIZE, 400);
      graphics.moveTo(0, i * GRID_SIZE);
      graphics.lineTo(400, i * GRID_SIZE);
    }
    graphics.strokePath();

    // Setup Particles
    this.particles = this.add.particles(0, 0, 'particle', {
      lifespan: 600,
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      emitting: false,
      tint: 0xEF4444
    });

    // Create Initial Snake (3 parts)
    for (let i = 0; i < 3; i++) {
      const part = this.add.image(200, 200 + i * GRID_SIZE, i === 0 ? 'head' : 'body');
      part.setOrigin(0, 0);
      part.setDepth(10); // Above grid
      
      // Add glow effect to snake
      part.setTint(i === 0 ? 0x22C55E : 0x4ADE80);
      this.snake.push(part);
    }

    // Create Food
    this.food = this.add.image(0, 0, 'food');
    this.food.setOrigin(0, 0);
    this.food.setDepth(9);
    
    // Add pulsing tween to food
    this.tweens.add({
      targets: this.food,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: 'Sine.easeInOut'
    });

    this.repositionFood();

    // Controls
    this.input.keyboard?.on('keydown-UP', () => { if (this.direction.y !== 1) this.nextDirection.set(0, -1); });
    this.input.keyboard?.on('keydown-DOWN', () => { if (this.direction.y !== -1) this.nextDirection.set(0, 1); });
    this.input.keyboard?.on('keydown-LEFT', () => { if (this.direction.x !== 1) this.nextDirection.set(-1, 0); });
    this.input.keyboard?.on('keydown-RIGHT', () => { if (this.direction.x !== -1) this.nextDirection.set(1, 0); });

    // Game Loop Timer (Speed increases slightly as score goes up)
    this.moveTimer = this.time.addEvent({
      delay: 130,
      callback: this.moveSnake,
      callbackScope: this,
      loop: true
    });

    // Notify React layer
    EventBus.emit('current-scene-ready', this);
  }

  moveSnake() {
    if (this.isGameOver) return;

    this.direction.copy(this.nextDirection);

    const head = this.snake[0];
    const newX = head.x + this.direction.x * GRID_SIZE;
    const newY = head.y + this.direction.y * GRID_SIZE;

    // Check Wall Collision
    if (newX < 0 || newX >= 400 || newY < 0 || newY >= 400) {
      this.gameOver();
      return;
    }

    // Check Self Collision
    for (let i = 0; i < this.snake.length; i++) {
      if (this.snake[i].x === newX && this.snake[i].y === newY) {
        this.gameOver();
        return;
      }
    }

    // Move Body
    let prevX = head.x;
    let prevY = head.y;

    head.setPosition(newX, newY);

    for (let i = 1; i < this.snake.length; i++) {
      const part = this.snake[i];
      const tempX = part.x;
      const tempY = part.y;
      
      // Add a slight tween for smooth movement instead of snapping
      this.tweens.add({
        targets: part,
        x: prevX,
        y: prevY,
        duration: 80,
        ease: 'Linear'
      });
      
      prevX = tempX;
      prevY = tempY;
    }

    // Check Food Collision
    if (newX === this.food.x && newY === this.food.y) {
      this.eatFood(prevX, prevY);
    }
  }

  eatFood(tailX: number, tailY: number) {
    this.score += 10;
    
    // Emit particles at food location
    this.particles.emitParticleAt(this.food.x + 10, this.food.y + 10, 15);
    
    // Create new body part
    const newPart = this.add.image(tailX, tailY, 'body');
    newPart.setOrigin(0, 0);
    newPart.setTint(0x4ADE80);
    newPart.setDepth(10);
    this.snake.push(newPart);

    // Speed up slightly
    if (this.moveTimer.timeScale < 2.0) {
      this.moveTimer.timeScale += 0.05;
    }

    this.repositionFood();
    
    // Send score to React
    EventBus.emit('score-update', this.score);
    
    // Quick camera zoom effect for juice
    this.cameras.main.zoomTo(1.02, 50, 'Linear', true, (cam, prog) => {
      if (prog === 1) this.cameras.main.zoomTo(1, 50);
    });
  }

  repositionFood() {
    let valid = false;
    let rx = 0, ry = 0;
    
    while (!valid) {
      rx = Phaser.Math.Between(0, 19) * GRID_SIZE;
      ry = Phaser.Math.Between(0, 19) * GRID_SIZE;
      valid = true;
      
      for (const part of this.snake) {
        if (part.x === rx && part.y === ry) {
          valid = false;
          break;
        }
      }
    }
    
    this.food.setPosition(rx, ry);
  }

  gameOver() {
    this.isGameOver = true;
    this.moveTimer.remove();
    
    // Camera shake for impact
    this.cameras.main.shake(300, 0.02);
    
    // Flash red
    this.cameras.main.flash(200, 255, 0, 0);

    // Tell React the game is over
    this.time.delayedCall(400, () => {
      EventBus.emit('game-over', this.score);
    });
  }
}
