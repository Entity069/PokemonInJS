import { Constants } from "./constants.js";
const constants = new Constants();

export class WorldMap {
    constructor() {
        this.map = constants.base_map;
        this.colliding_objects = constants.colliding_objects;

        this.tileset_size = 8;               // source pixels per tile
        this.tileset_scale_factor = 4;       // scale factor
        this.tileset_scaled_size = this.tileset_size * this.tileset_scale_factor;

        this.org_cols = 184;
        this.org_rows = 168;
        this.map_cols = 120;
        this.map_rows = 80;
        this.src = "./assets/textures/map.png";
    }

    draw(tileMap, ctx, camera) {
        const startCol = Math.floor(camera.x / this.tileset_scaled_size);
        const endCol = Math.ceil((camera.x + camera.viewportWidth) / this.tileset_scaled_size);
        const startRow = Math.floor(camera.y / this.tileset_scaled_size);
        const endRow = Math.ceil((camera.y + camera.viewportHeight) / this.tileset_scaled_size);
        
        const maxCol = Math.min(endCol, this.map_cols);
        const maxRow = Math.min(endRow, this.map_rows);
        
        for (let row = Math.max(0, startRow); row < maxRow; row++) {
            for (let col = Math.max(0, startCol); col < maxCol; col++) {
                const map_index = row * this.map_cols + col;
                const tileVal = this.map[map_index];
                
                if (tileVal !== 0) {
                    const tv = tileVal - 1;
                    const sx = (tv % this.org_cols) * this.tileset_size;
                    const sy = Math.floor(tv / this.org_cols) * this.tileset_size;
                    
                    const dx = col * this.tileset_scaled_size - camera.x;
                    const dy = row * this.tileset_scaled_size - camera.y;

                    ctx.drawImage(tileMap, sx, sy, this.tileset_size, this.tileset_size, dx, dy, this.tileset_scaled_size, this.tileset_scaled_size);
                }
            }
        }
    }
}