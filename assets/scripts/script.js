import { WorldMap } from "./map.js";
import { PlayerObject } from "./player.js";
import { Camera } from "./camera.js";
import { CollisionSystem } from "./collision.js";
import { Pokemon, getRandomPokemon, PokemonSelector } from "./pokemon.js";
import { Battle } from "./battle.js";
import { Encounter } from "./encounter.js";
import { AudioManager } from "./audioManager.js";

const gameView = document.getElementById("gameCanvas");
const battleView = document.getElementById("battleCanvas");
const gameCtx = gameView.getContext("2d");
const battleCtx = battleView.getContext("2d");
gameCtx.translate(0.5, 0.5);

window.isBattleScene = false;
let currentBattle = null;

gameView.width = window.innerWidth;
gameView.height = window.innerHeight;
battleView.width = window.innerWidth;
battleView.height = window.innerHeight;

gameCtx.imageSmoothingEnabled = false;
battleCtx.imageSmoothingEnabled = false;

const fontFace = new FontFace('Pokemon Fire Red', 'url(./assets/fonts/poke.woff)');
document.fonts.add(fontFace);

const audioManager = new AudioManager();

const worldMap = new WorldMap();
const tileMap = new Image();
tileMap.src = worldMap.src;

const startX = worldMap.map_cols * worldMap.tileset_scaled_size / 3;
const startY = worldMap.map_rows * worldMap.tileset_scaled_size / 3;

const player = new PlayerObject(startX, startY, 2, worldMap.tileset_scaled_size / 2, worldMap );

const pokemonSelector = new PokemonSelector(player, audioManager);

const camera = new Camera(0, 0, gameView.width, gameView.height);
const collisionSystem = new CollisionSystem(worldMap);
const encounter = new Encounter(worldMap, player, audioManager, pokemonSelector);

audioManager.toggleInfoModal();

function fadeTransition(callback) {
    const fadeOverlay = document.createElement('div');
    fadeOverlay.id = 'fadeOverlay';
    fadeOverlay.style.position = 'absolute';
    fadeOverlay.style.top = '0';
    fadeOverlay.style.left = '0';
    fadeOverlay.style.width = '100%';
    fadeOverlay.style.height = '100%';
    fadeOverlay.style.backgroundColor = 'black';
    fadeOverlay.style.opacity = '0';
    fadeOverlay.style.zIndex = '1000';
    fadeOverlay.style.pointerEvents = 'none';
    document.body.appendChild(fadeOverlay);
    
    let opacity = 0;
    const fadeIn = setInterval(() => {
        opacity += 0.05;
        fadeOverlay.style.opacity = opacity.toString();
        
        if (opacity >= 1) {
            clearInterval(fadeIn);
            
            callback();
        
            let fadeOutOpacity = 1;
            const fadeOut = setInterval(() => {
                fadeOutOpacity -= 0.05;
                fadeOverlay.style.opacity = fadeOutOpacity.toString();
                
                if (fadeOutOpacity <= 0) {
                    clearInterval(fadeOut);
                    document.body.removeChild(fadeOverlay);
                }
            }, 50);
        }
    }, 50);
}

function startBattle() {
    window.isBattleScene = true;
    gameView.style.display = "none";
    battleView.style.display = "block";
}

function endBattle() {
    fadeTransition(() => {
        window.isBattleScene = false;
        gameView.style.display = "block";
        battleView.style.display = "none";
        currentBattle = null;
        
        audioManager.playTrack('overworld');
    });
}

// for debug
// window.addEventListener('keydown', e => {
//     if (e.code === 'Escape' && window.isBattleScene) {
//         endBattle();
//     }
// });

//for debug
// window.addEventListener('keydown', async e => {
//     if (e.code === 'Space' && !window.isBattleScene) {
//         fadeTransition(async () => {
//             startBattle();

//             let playerMon;
//             const selectedPokemon = pokemonSelector.getSelectedPokemon();
            
//             if (selectedPokemon) {
//                 playerMon = selectedPokemon;
//                 playerMon.currentHP = playerMon.maxHealth;
//             } else {
//                 const playerName = await getRandomPokemon();
//                 playerMon = new Pokemon(playerName);
//                 await playerMon.setDetails();
//                 playerMon.level = 50;
//                 playerMon.maxHealth = 20;
//                 playerMon.currentHP = 20;
//             }

//             const wildName = await getRandomPokemon();
//             const wildMon = new Pokemon(wildName);
//             await wildMon.setDetails();
//             wildMon.level = 45;
//             wildMon.maxHealth = 110;
//             wildMon.currentHP = 110;
            
//             currentBattle = new Battle(playerMon, wildMon, battleCtx, audioManager);
//         });
//     }
// });

// for debug
// function encounterPoints() {
//     if (!debugMode) return;
    
//     encounter.encounterPoints.forEach(point => {
//         gameCtx.beginPath();
//         gameCtx.arc(
//             point.x - camera.x,
//             point.y - camera.y,
//             10,
//             0,
//             Math.PI * 2
//         );
//         gameCtx.fillStyle = 'red';
//         gameCtx.fill();
        
//         gameCtx.beginPath();
//         gameCtx.arc(
//             point.x - camera.x,
//             point.y - camera.y,
//             point.radius,
//             0,
//             Math.PI * 2
//         );
//         gameCtx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
//         gameCtx.stroke();
//     });
// }

// let debugMode = false;
// window.addEventListener('keydown', e => {
//     if (e.code === 'KeyJ') {
//         debugMode = !debugMode;
//     }
// });

window.addEventListener('keydown', e => {
    if (e.code === 'Space' && window.isBattleScene && currentBattle) {
        if (currentBattle.currentState === currentBattle.battleStates.VICTORY || 
            currentBattle.currentState === currentBattle.battleStates.DEFEAT || 
            currentBattle.currentState === currentBattle.battleStates.RUN) {
            endBattle();
        }
    }
});

// game loop
async function gameLoop() {
    if (!window.isBattleScene) {
        gameCtx.clearRect(0, 0, gameView.width, gameView.height);
        
        const previousX = player.x;
        const previousY = player.y;
        
        player.update();
        
        if (collisionSystem.checkCollision(player)) {
            player.x = previousX;
            player.y = previousY;
        }

        if ((previousX !== player.x || previousY !== player.y) && !encounter.isFading) {
            const battleObject = await encounter.checkForEncounter(gameView, battleView, gameCtx, battleCtx);
            if (battleObject) {
                currentBattle = battleObject;
                window.isBattleScene = true;
            }
        }
        
        camera.update(player, worldMap);
        worldMap.draw(tileMap, gameCtx, camera);

        player.draw(gameCtx, camera);
        
        audioManager.drawUI(gameCtx);
        
        // if (debugMode) {
        //     encounterPoints();
        // }
    }
    else {
        battleCtx.clearRect(0, 0, battleView.width, battleView.height);
        
        if (currentBattle) {
            const shouldEndBattle = currentBattle.update();
            currentBattle.draw(battleCtx);
            
            if (shouldEndBattle) {
                endBattle();
            }
        }
    }
    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', () => {
    battleView.style.display = "none";
    
    const style = document.createElement('style');
    style.textContent = `
        #fadeOverlay {
            transition: opacity 0.05s linear;
        }
    `;
    document.head.appendChild(style);
    
    if (tileMap.complete) {
        audioManager.playTrack('overworld');
        gameLoop();
    } else {
        tileMap.onload = () => {
            audioManager.playTrack('overworld');
            gameLoop();
        };
    }
});