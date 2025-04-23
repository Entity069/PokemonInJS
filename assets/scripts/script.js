import { WorldMap } from "./map.js";
import { PlayerObject } from "./player.js";
import { Camera } from "./camera.js";
import { CollisionSystem } from "./collision.js";

const gameView = document.getElementById("gameCanvas");
const ctx = gameView.getContext("2d");

gameView.width = window.innerWidth;
gameView.height = window.innerHeight;

const worldMap = new WorldMap();
const tileMap = new Image();
tileMap.src = worldMap.src;

const startX = worldMap.map_cols * worldMap.tileset_scaled_size / 3;
const startY = worldMap.map_rows * worldMap.tileset_scaled_size / 3;
const player = new PlayerObject(startX, startY, 2, worldMap.tileset_scaled_size / 2);


const camera = new Camera(0, 0, gameView.width, gameView.height);
const collisionSystem = new CollisionSystem(worldMap);

// game loop
function gameLoop() {
    ctx.clearRect(0, 0, gameView.width, gameView.height);
    
    const previousX = player.x;
    const previousY = player.y;
    
    player.update();
    
    if (collisionSystem.checkCollision(player)) {
        player.x = previousX;
        player.y = previousY;
    }
    camera.update(player, worldMap);
    worldMap.draw(tileMap, ctx, camera);
    player.draw(ctx, camera);
    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', () => {
    if (tileMap.complete) {
        gameLoop();
    } else {
        tileMap.onload = () => {
            gameLoop();
        };
    }
});