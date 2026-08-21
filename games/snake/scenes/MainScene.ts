import { Scene } from 'phaser';
import { EventBus } from '../engine/EventBus';

const WORLD_SIZE = 3000;
const INITIAL_LENGTH = 15; // Slither style, you start with a few segments
const SEGMENT_SPACING = 4; // Frames between each body segment in the history

interface Position {
  x: number;
  y: number;
  rotation: number;
}

export class MainScene extends Scene {
  private snakeHead!: Phaser.Physics.Arcade.Image;
  private snakeBody: Phaser.GameObjects.Image[] = [];
  private positionHistory: Position[] = [];
  private foodGroup!: Phaser.GameObjects.Group;
  
  private targetAngle: number = 0;
  private currentAngle: number = 0;
  private speed: number = 250;
  
  private isGameOver = false;
  private score = 0;
  private bg!: Phaser.GameObjects.TileSprite;

  constructor() {
    super('MainScene');
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.snakeBody = [];
    this.positionHistory = [];
    
    // Set World Bounds
    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    
    // Create tiled background
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg-grid');
    this.bg.setOrigin(0, 0);
    this.bg.setScrollFactor(0); // It will scroll manually via tilePosition
    this.bg.setDepth(-1);

    // Create snake head
    this.snakeHead = this.physics.add.image(WORLD_SIZE / 2, WORLD_SIZE / 2, 'head');
    this.snakeHead.setDepth(100);
    this.snakeHead.setCircle(21); // Adjust for collisions

    // Initialize position history
    for (let i = 0; i < INITIAL_LENGTH * SEGMENT_SPACING; i++) {
      this.positionHistory.push({
        x: this.snakeHead.x,
        y: this.snakeHead.y,
        rotation: 0
      });
    }

    // Create initial body segments
    for (let i = 0; i < INITIAL_LENGTH; i++) {
      this.addBodySegment();
    }

    // Camera setup
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.snakeHead, true, 0.1, 0.1);
    this.cameras.main.setZoom(0.8);

    // Food Group
    this.foodGroup = this.add.group();
    for (let i = 0; i < 400; i++) {
      this.spawnFood();
    }

    // Controls
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Calculate angle from snake head to mouse pointer (relative to camera)
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.targetAngle = Phaser.Math.Angle.Between(
        this.snakeHead.x, 
        this.snakeHead.y, 
        worldPoint.x, 
        worldPoint.y
      );
    });

    // Notify React layer
    EventBus.emit('current-scene-ready', this);
  }

  addBodySegment() {
    const part = this.add.image(this.snakeHead.x, this.snakeHead.y, 'body');
    part.setDepth(99 - this.snakeBody.length);
    this.snakeBody.push(part);
  }

  spawnFood() {
    const x = Phaser.Math.Between(50, WORLD_SIZE - 50);
    const y = Phaser.Math.Between(50, WORLD_SIZE - 50);
    
    const food = this.physics.add.image(x, y, 'food-base');
    
    // Random bright tint
    const colors = [0xFF3366, 0x33CCFF, 0x99FF33, 0xFFCC00, 0x9933FF];
    food.setTint(Phaser.Utils.Array.GetRandom(colors));
    
    // Add pulsing effect
    this.tweens.add({
      targets: food,
      scaleX: 1.5,
      scaleY: 1.5,
      yoyo: true,
      repeat: -1,
      duration: Phaser.Math.Between(600, 1000),
      ease: 'Sine.easeInOut'
    });

    this.foodGroup.add(food);
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    // Smooth rotation towards target angle (lerp angle)
    this.currentAngle = Phaser.Math.Angle.RotateTo(
      this.currentAngle, 
      this.targetAngle, 
      0.1 // rotation speed
    );

    // Set head rotation (adding Math.PI/2 because our head graphic eyes face "up" by default)
    this.snakeHead.rotation = this.currentAngle + Math.PI / 2;

    // Move head forward based on current angle
    const velocityX = Math.cos(this.currentAngle) * this.speed;
    const velocityY = Math.sin(this.currentAngle) * this.speed;
    
    this.snakeHead.x += (velocityX * delta) / 1000;
    this.snakeHead.y += (velocityY * delta) / 1000;

    // Bound to world
    if (this.snakeHead.x < 0) this.snakeHead.x = 0;
    if (this.snakeHead.x > WORLD_SIZE) this.snakeHead.x = WORLD_SIZE;
    if (this.snakeHead.y < 0) this.snakeHead.y = 0;
    if (this.snakeHead.y > WORLD_SIZE) this.snakeHead.y = WORLD_SIZE;

    // Record position history
    this.positionHistory.unshift({
      x: this.snakeHead.x,
      y: this.snakeHead.y,
      rotation: this.snakeHead.rotation
    });

    // Remove old history to save memory
    const maxHistory = this.snakeBody.length * SEGMENT_SPACING + 1;
    if (this.positionHistory.length > maxHistory) {
      this.positionHistory.pop();
    }

    // Update body segments based on history
    for (let i = 0; i < this.snakeBody.length; i++) {
      const historyIndex = (i + 1) * SEGMENT_SPACING;
      // If we don't have enough history yet, use the oldest available
      const pos = this.positionHistory[Math.min(historyIndex, this.positionHistory.length - 1)];
      
      if (pos) {
        this.snakeBody[i].x = pos.x;
        this.snakeBody[i].y = pos.y;
      }
    }

    // Scroll Background parallax style
    this.bg.tilePositionX = this.cameras.main.scrollX;
    this.bg.tilePositionY = this.cameras.main.scrollY;

    // Collision Detection: Food
    this.physics.overlap(this.snakeHead, this.foodGroup, this.eatFood, undefined, this);
    
    // Collision Detection: World Bounds (Die if hitting wall)
    if (
      this.snakeHead.x <= 10 || 
      this.snakeHead.x >= WORLD_SIZE - 10 || 
      this.snakeHead.y <= 10 || 
      this.snakeHead.y >= WORLD_SIZE - 10
    ) {
      this.gameOver();
    }

    // Self Collision (Checking from segment 15 onwards to avoid instant self-collision on tight turns)
    for (let i = 15; i < this.snakeBody.length; i++) {
      const dist = Phaser.Math.Distance.Between(
        this.snakeHead.x, this.snakeHead.y,
        this.snakeBody[i].x, this.snakeBody[i].y
      );
      if (dist < 20) {
        this.gameOver();
        break;
      }
    }
  }

  eatFood(head: any, food: any) {
    // Remove the eaten food
    this.foodGroup.remove(food, true, true);
    
    this.score += 10;
    EventBus.emit('score-update', this.score);
    
    // Add new body segment
    this.addBodySegment();

    // Spawn a new food somewhere
    this.spawnFood();
    
    // Very subtle zoom effect for juice
    if (this.cameras.main.zoom < 0.85) {
      this.cameras.main.zoomTo(this.cameras.main.zoom + 0.01, 100, 'Linear', true, (cam, prog) => {
        if (prog === 1) this.cameras.main.zoomTo(0.8, 200);
      });
    }
  }

  gameOver() {
    this.isGameOver = true;
    
    // Shake camera
    this.cameras.main.shake(500, 0.05);
    this.cameras.main.flash(300, 255, 0, 0);

    // Stop movement
    this.speed = 0;

    // Tell React
    this.time.delayedCall(600, () => {
      EventBus.emit('game-over', this.score);
    });
  }
}
