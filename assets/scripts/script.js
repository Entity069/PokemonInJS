import { WorldMap } from "./map.js";
import { PlayerObject } from "./player.js";
import { Camera } from "./camera.js";
import { CollisionSystem } from "./collision.js";

const gameView = document.getElementById("gameCanvas");
const battleView = document.getElementById("battleCanvas");
const gameCtx = gameView.getContext("2d");
const battleCtx = battleView.getContext("2d");

let isBattleScene = false;

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

function startBattle() {
    isBattleScene = true;
    gameView.style.display = "none";
    battleView.style.display = "block";
}

function endBattle() {
    isBattleScene = false;
    gameView.style.display = "block";
    battleView.style.display = "none";
}
// game loop
function gameLoop() {
    if (!isBattleScene) {
        gameCtx.clearRect(0, 0, gameView.width, gameView.height);
        
        const previousX = player.x;
        const previousY = player.y;
        
        player.update();
        
        if (collisionSystem.checkCollision(player)) {
            player.x = previousX;
            player.y = previousY;
        }
        camera.update(player, worldMap);
        worldMap.draw(tileMap, gameCtx, camera);
        player.draw(gameCtx, camera);
    }
    else {
        
    }
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