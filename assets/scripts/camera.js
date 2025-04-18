export class Camera {
    constructor(x, y, viewportWidth, viewportHeight) {
        this.x = x;
        this.y = y;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
    }
    
    update(target, worldMap) {
        this.x = target.x - this.viewportWidth / 2;
        this.y = target.y - this.viewportHeight / 2;
        
        const maxX = worldMap.map_cols * worldMap.tileset_scaled_size - this.viewportWidth;
        const maxY = worldMap.map_rows * worldMap.tileset_scaled_size - this.viewportHeight;
        
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    }
}