import { Scene } from 'phaser';
import { EventBus } from '../engine/EventBus';

const WORLD_SIZE = 4000; // Even bigger world
const INITIAL_LENGTH = 15;
const SEGMENT_SPACING = 5; 

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
  
  private targetAngle: number = -Math.PI / 2; // Point UP initially
  private currentAngle: number = -Math.PI / 2;
  
  private baseSpeed = 250;
  private boostSpeed = 450;
  private currentSpeed = 250;
  private isBoosting = false;
  
  private isGameOver = false;
  private score = 0;
  private bg!: Phaser.GameObjects.TileSprite;
  private scoreDropTimer = 0;

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
    
    // Create tiled hexagonal background
    // Calculate tile size from Preloader math (approx 138 x 120)
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg-hex');
    this.bg.setOrigin(0, 0);
    this.bg.setScrollFactor(0);
    this.bg.setDepth(-1);

    // Create snake head
    const startX = WORLD_SIZE / 2;
    const startY = WORLD_SIZE / 2;
    this.snakeHead = this.physics.add.image(startX, startY, 'head');
    this.snakeHead.setDepth(100);
    this.snakeHead.setCircle(18); // Smaller collision box for leniency

    // Initialize position history beautifully in a straight line pointing down (so snake slithers UP)
    for (let i = 0; i < INITIAL_LENGTH * SEGMENT_SPACING; i++) {
      this.positionHistory.push({
        x: startX,
        y: startY + (i * 4), // Stretch it downwards by 4 pixels per frame
        rotation: this.currentAngle + Math.PI / 2
      });
    }

    // Create initial body segments
    for (let i = 0; i < INITIAL_LENGTH; i++) {
      this.addBodySegment();
    }

    // Camera setup
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.snakeHead, true, 0.05, 0.05); // Smooth lerp
    this.cameras.main.setZoom(0.85);

    // Food Group
    this.foodGroup = this.add.group();
    for (let i = 0; i < 600; i++) {
      this.spawnFood();
    }

    // Controls: Pointer Movement
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.targetAngle = Phaser.Math.Angle.Between(
        this.snakeHead.x, 
        this.snakeHead.y, 
        worldPoint.x, 
        worldPoint.y
      );
    });

    // Controls: Boosting (Left Click or Space)
    this.input.on('pointerdown', () => { this.isBoosting = true; });
    this.input.on('pointerup', () => { this.isBoosting = false; });
    this.input.keyboard?.on('keydown-SPACE', () => { this.isBoosting = true; });
    this.input.keyboard?.on('keyup-SPACE', () => { this.isBoosting = false; });

    // Handle screen resizing
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      if (this.bg) {
        this.bg.setSize(gameSize.width, gameSize.height);
      }
    });

    EventBus.emit('current-scene-ready', this);
  }

  addBodySegment() {
    const part = this.add.image(this.snakeHead.x, this.snakeHead.y, 'body');
    part.setDepth(99 - this.snakeBody.length); // Render below the previous segment
    this.snakeBody.push(part);
  }

  spawnFood(dropX?: number, dropY?: number) {
    const x = dropX ?? Phaser.Math.Between(50, WORLD_SIZE - 50);
    const y = dropY ?? Phaser.Math.Between(50, WORLD_SIZE - 50);
    
    const food = this.physics.add.image(x, y, 'food-base');
    
    // Random bright tint
    const colors = [0xFF3366, 0x33CCFF, 0x99FF33, 0xFFCC00, 0x9933FF, 0xEE00FF];
    food.setTint(Phaser.Utils.Array.GetRandom(colors));
    
    // Pulsing effect
    this.tweens.add({
      targets: food,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      repeat: -1,
      duration: Phaser.Math.Between(800, 1200),
      ease: 'Sine.easeInOut'
    });

    this.foodGroup.add(food);
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    // Boosting Mechanics
    if (this.isBoosting && this.score > 0 && this.snakeBody.length > 5) {
      this.currentSpeed = this.boostSpeed;
      this.scoreDropTimer += delta;
      
      // Drop score and food behind the snake when boosting
      if (this.scoreDropTimer > 150) { // Every 150ms of boosting
        this.score = Math.max(0, this.score - 2);
        EventBus.emit('score-update', this.score);
        
        // Drop food at the tail
        const tail = this.snakeBody[this.snakeBody.length - 1];
        if (tail) {
          this.spawnFood(tail.x, tail.y);
          // Remove a segment if we lost enough score
          if (this.snakeBody.length > INITIAL_LENGTH + Math.floor(this.score / 10)) {
            const removed = this.snakeBody.pop();
            removed?.destroy();
          }
        }
        this.scoreDropTimer = 0;
      }
    } else {
      this.currentSpeed = this.baseSpeed;
      this.isBoosting = false;
    }

    // Smooth rotation towards target angle (lerp angle)
    // Slower rotation when boosting for balance
    const rotationSpeed = this.isBoosting ? 0.05 : 0.12; 
    this.currentAngle = Phaser.Math.Angle.RotateTo(
      this.currentAngle, 
      this.targetAngle, 
      rotationSpeed
    );

    // Set head rotation
    this.snakeHead.rotation = this.currentAngle + Math.PI / 2;

    // Move head forward
    const velocityX = Math.cos(this.currentAngle) * this.currentSpeed;
    const velocityY = Math.sin(this.currentAngle) * this.currentSpeed;
    
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

    // Determine segment spacing based on speed (boost spreads segments out in history)
    const activeSpacing = this.isBoosting ? Math.floor(SEGMENT_SPACING * 0.7) : SEGMENT_SPACING;

    // Update body segments based on history
    for (let i = 0; i < this.snakeBody.length; i++) {
      const historyIndex = (i + 1) * activeSpacing;
      const pos = this.positionHistory[Math.min(historyIndex, this.positionHistory.length - 1)];
      
      if (pos) {
        this.snakeBody[i].x = pos.x;
        this.snakeBody[i].y = pos.y;
      }
    }

    // Remove old history to save memory
    const maxHistory = this.snakeBody.length * SEGMENT_SPACING + 10;
    if (this.positionHistory.length > maxHistory) {
      this.positionHistory.length = maxHistory; // Truncate array instantly
    }

    // Scroll Background parallax style
    this.bg.tilePositionX = this.cameras.main.scrollX;
    this.bg.tilePositionY = this.cameras.main.scrollY;

    // Collision Detection: Food
    this.physics.overlap(this.snakeHead, this.foodGroup, this.eatFood, undefined, this);
    
    // Collision Detection: World Bounds
    if (
      this.snakeHead.x <= 15 || 
      this.snakeHead.x >= WORLD_SIZE - 15 || 
      this.snakeHead.y <= 15 || 
      this.snakeHead.y >= WORLD_SIZE - 15
    ) {
      this.gameOver();
    }

    // Self Collision (Safe check past the first 15 segments)
    if (this.snakeBody.length > 20) {
      // Only check every few frames for performance, or check a subset
      for (let i = 20; i < this.snakeBody.length; i += 2) {
        const dist = Phaser.Math.Distance.Between(
          this.snakeHead.x, this.snakeHead.y,
          this.snakeBody[i].x, this.snakeBody[i].y
        );
        
        // Leniency on self collision distance
        if (dist < 18) {
          this.gameOver();
          break;
        }
      }
    }
  }

  eatFood(head: any, food: any) {
    this.foodGroup.remove(food, true, true);
    
    this.score += 10;
    EventBus.emit('score-update', this.score);
    
    // Add new body segment every 10 points
    this.addBodySegment();
    
    // Slight size pulse to the head
    this.tweens.add({
      targets: this.snakeHead,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 100,
      ease: 'Quad.easeOut'
    });

    this.spawnFood();
  }

  gameOver() {
    this.isGameOver = true;
    
    // Shake camera
    this.cameras.main.shake(600, 0.04);
    this.cameras.main.flash(300, 255, 0, 0);

    // Blast food outward from the body to simulate bursting
    for (let i = 0; i < this.snakeBody.length; i += 2) {
      const part = this.snakeBody[i];
      const explodedFood = this.physics.add.image(part.x, part.y, 'food-base');
      explodedFood.setTint(0xEF4444);
      
      const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
      const velocity = Phaser.Math.Between(100, 300);
      explodedFood.setVelocity(Math.cos(angle) * velocity, Math.sin(angle) * velocity);
      
      this.tweens.add({
        targets: explodedFood,
        alpha: 0,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => explodedFood.destroy()
      });
    }

    // Tell React
    this.time.delayedCall(800, () => {
      EventBus.emit('game-over', this.score);
    });
  }
}
