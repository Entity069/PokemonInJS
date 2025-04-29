export class CollisionSystem {
    constructor(worldMap) {
        this.worldMap = worldMap;
    }

    checkCollision(player) {
        const tileSize = this.worldMap.tileset_scaled_size;
        
        const playerLeft = player.x - player.size / 2;
        const playerRight = player.x + player.size / 2;
        const playerTop = player.y - player.size / 2;
        const playerBottom = player.y + player.size / 2;
        
        const leftTile = Math.floor(playerLeft / tileSize);
        const rightTile = Math.floor(playerRight / tileSize);
        const topTile = Math.floor(playerTop / tileSize);
        const bottomTile = Math.floor(playerBottom / tileSize);

        for (let y = topTile; y <= bottomTile; y++) {
            for (let x = leftTile; x <= rightTile; x++) {
                if (x < 0 || x >= this.worldMap.map_cols || y < 0 || y >= this.worldMap.map_rows) {
                    continue;
                }

                const mapIndex = y * this.worldMap.map_cols + x;
                // console.log(`Checking tile at index: ${mapIndex}, value: ${this.worldMap.map[mapIndex]}`);
                const tileValue = this.worldMap.map[mapIndex];
                
                if (this.worldMap.colliding_objects.includes(tileValue)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}