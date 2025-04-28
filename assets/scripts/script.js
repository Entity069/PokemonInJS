import { WorldMap } from "./map.js";
import { PlayerObject } from "./player.js";
import { Camera } from "./camera.js";
import { CollisionSystem } from "./collision.js";
import { Pokemon, getRandomPokemon } from "./pokemon.js";
import { Battle } from "./battle.js";

const gameView = document.getElementById("gameCanvas");
const battleView = document.getElementById("battleCanvas");
const gameCtx = gameView.getContext("2d");
const battleCtx = battleView.getContext("2d");

let isBattleScene = false;
let currentBattle = null;

gameView.width = window.innerWidth;
gameView.height = window.innerHeight;
battleView.width = 960;
battleView.height = 845;

gameCtx.imageSmoothingEnabled = false;
battleCtx.imageSmoothingEnabled = false;

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
    currentBattle = null;
}

window.addEventListener('keydown', e => {
    if (e.code === 'Escape' && isBattleScene) {
        endBattle();
    }
});

window.addEventListener('keydown', async e => {
    if (e.code === 'Space' && !isBattleScene) {
        startBattle();

        const playerName = await getRandomPokemon();
        const playerMon = new Pokemon(playerName);
        await playerMon.setDetails();
        playerMon.level = 50;
        playerMon.maxHealth = 120;
        playerMon.health = 120;

        console.log(playerMon.moves);
  
        const wildName   = await getRandomPokemon();
        const wildMon = new Pokemon(wildName);
        await wildMon.setDetails();
        wildMon.level = 45;
        wildMon.maxHealth = 110;
        wildMon.health = 110;

        console.log(`${playerMon.name} vs ${wildMon.name}`);
        
        currentBattle = new Battle(playerMon, wildMon);
    }
});

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
        battleCtx.clearRect(0, 0, battleView.width, battleView.height);
        
        if (currentBattle) {
            currentBattle.update();
            currentBattle.draw(battleCtx);
        }
    }
    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', () => {
    battleView.style.display = "none";
    
    if (tileMap.complete) {
        gameLoop();
    } else {
        tileMap.onload = () => {
            gameLoop();
        };
    }
});