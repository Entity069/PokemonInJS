import { Controls } from './controls.js';

export class PlayerObject {
  constructor(x = 0, y = 0, speed = 2, size = 24) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
    this.controls = new Controls();
    
    // Animation properties
    this.spriteImage = new Image();
    this.spriteImage.src = './assets/textures/player.png';
    this.frameWidth = 16;
    this.frameHeight = 16;
    this.frameCount = 4;
    this.currentFrame = 0;
    this.animationSpeed = 10;
    this.animationCounter = 0;
    this.direction = 'down';
    this.isMoving = false;
    

    // todo. idk how to animate but either different images or single sprite shit
    this.directions = {
      down: 0,
      left: 1,
      right: 2,
      up: 3
    };
  }

  update() {
    let dx = 0, dy = 0;
    this.isMoving = false;
    
    if (this.controls.keys['ArrowUp'] || this.controls.keys['w'] || this.controls.keys['W']) {
      dy = -this.speed;
      this.direction = 'up';
      this.isMoving = true;
    }
    if (this.controls.keys['ArrowDown'] || this.controls.keys['s'] || this.controls.keys['S']) {
      dy = this.speed;
      this.direction = 'down';
      this.isMoving = true;
    }
    if (this.controls.keys['ArrowLeft'] || this.controls.keys['a'] || this.controls.keys['A']) {
      dx = -this.speed;
      this.direction = 'left';
      this.isMoving = true;
    }
    if (this.controls.keys['ArrowRight'] || this.controls.keys['d'] || this.controls.keys['D']) {
      dx = this.speed;
      this.direction = 'right';
      this.isMoving = true;
    }

    this.x += dx;
    this.y += dy;
    
    if (this.isMoving) {
      this.animationCounter++;
      if (this.animationCounter >= this.animationSpeed) {
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        this.animationCounter = 0;
      }
    } else {
      this.currentFrame = 0;
    }
  }

  draw(ctx, camera) {
    if (!this.spriteImage.complete) {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(
        this.x - camera.x - this.size / 2,
        this.y - camera.y - this.size / 2,
        this.size,
        this.size
      );
      return;
    }
    
    const directionRow = this.directions[this.direction];
    
    ctx.drawImage(
      this.spriteImage,
      this.currentFrame * this.frameWidth,
      directionRow * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.x - camera.x - this.size / 2,
      this.y - camera.y - this.size / 2,
      this.size,
      this.size
    );
  }
}