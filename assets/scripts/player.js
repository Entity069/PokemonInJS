import { Controls } from './controls.js';

export class PlayerObject {
  constructor(x = 0, y = 0, speed = 1.5, size = 16, worldMap) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
    this.controls = new Controls();
    this.worldMap = worldMap;
    
    this.spriteImage = new Image();
    this.spriteImage.src = './assets/textures/player-2.png';
    this.frameWidth = 16;
    this.frameHeight = 21;
    this.frameCount = 3;
    this.currentFrame = 1; 
    this.animationSpeed = 10;
    this.animationCounter = 0;
    this.direction = 'down';
    this.isMoving = false;
    
    this.directions = {
      down: 0,
      up:   1,
      left: 2,
      right:3
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
      this.currentFrame = 1;
      this.animationCounter = 0;
    }
  }

  getCurrentTileValue() {
    const tileSize = this.worldMap.tileset_scaled_size;
    const tileX = Math.floor(this.x / tileSize);
    const tileY = Math.floor(this.y / tileSize);
    
    if (tileX < 0 || tileX >= this.worldMap.map_cols || tileY < 0 || tileY >= this.worldMap.map_rows) {
      return null;
    }
    
    const mapIndex = tileY * this.worldMap.map_cols + tileX;
    return this.worldMap.map[mapIndex];
  }

  draw(ctx, camera) {
    if (!this.spriteImage.complete) {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(
        this.x - camera.x - this.size/2,
        this.y - camera.y - this.size/2,
        this.size,
        this.size
      );
      return;
    }
    
    const row = this.directions[this.direction];
    ctx.drawImage(
      this.spriteImage,
      this.currentFrame * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.x - camera.x - this.size/2,
      this.y - camera.y - this.size/2,
      this.size * 3,
      this.size * 3
    );
  }
}