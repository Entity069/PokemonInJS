import { Constants } from "./constants.js";
import { Pokemon, getRandomPokemon } from "./pokemon.js";
import { Battle } from "./battle.js";

export class Encounter {
    constructor(worldMap, player, audioManager) {
        this.worldMap = worldMap;
        this.player = player;
        this.audioManager = audioManager;
        this.constants = new Constants();
        this.movableTiles = this.constants.movable_tiles;
        
        this.encounterRate = 10;
        this.encounterCounts = 20;
        
        this.lastPlayerX = player.x;
        this.lastPlayerY = player.y;
        
        this.encounterPoints = this.generateEncounterPoints(this.encounterCounts);
        
        // fade effect properties
        this.isFading = false;
        this.fadeOpacity = 0;
        this.fadeDirection = 'in'; // 'in' or 'out'
        this.fadeDuration = 1000; // 1 second fade
        this.fadeStartTime = 0;
    }
    

    generateEncounterPoints(count) {
        const points = [];
        const mapWidth = this.worldMap.map_cols * this.worldMap.tileset_scaled_size;
        const mapHeight = this.worldMap.map_rows * this.worldMap.tileset_scaled_size;
        
        const gridSize = Math.ceil(Math.sqrt(count));
        const cellWidth = mapWidth / gridSize;
        const cellHeight = mapHeight / gridSize;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (points.length >= count) break;
                
                const baseX = i * cellWidth;
                const baseY = j * cellHeight;
                
                const randomX = baseX + Math.random() * cellWidth;
                const randomY = baseY + Math.random() * cellHeight;
                
                const tileX = Math.floor(randomX / this.worldMap.tileset_scaled_size);
                const tileY = Math.floor(randomY / this.worldMap.tileset_scaled_size);
                
                // checks if the tile is a valid movable tile and not in colliding position
                const tileIndex = tileY * this.worldMap.map_cols + tileX;
                if (this.movableTiles.includes(this.worldMap.map[tileIndex])) {
                    points.push({
                        x: tileX * this.worldMap.tileset_scaled_size,
                        y: tileY * this.worldMap.tileset_scaled_size,
                        radius: 20 // radius of detection
                    });
                }
            }
        }
        // what if some points are in colliding position and we get lesser points? we try to add more.
        while (points.length < count) {
            const randX = Math.floor(Math.random() * this.worldMap.map_cols);
            const randY = Math.floor(Math.random() * this.worldMap.map_rows);
            const tileIndex = randY * this.worldMap.map_cols + randX;
            
            if (this.movableTiles.includes(this.worldMap.map[tileIndex])) {
                points.push({
                    x: randX * this.worldMap.tileset_scaled_size,
                    y: randY * this.worldMap.tileset_scaled_size,
                    radius: 20
                });
            }
        }
        
        console.log(`Generated ${points.length} encounter points`);
        return points;
    }
    
    isEncounter() {
        for (const point of this.encounterPoints) {
            const dx = this.player.x - point.x;
            const dy = this.player.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < point.radius) {
                if (Math.random() * this.encounterRate < 1) {
                    return true;
                }
            }
        }
        return false;
    }
    
    playerMoved() {
        const hasMoved = this.player.x !== this.lastPlayerX || this.player.y !== this.lastPlayerY;
        
        this.lastPlayerX = this.player.x;
        this.lastPlayerY = this.player.y;
        
        return hasMoved;
    }
    
    async checkForEncounter(gameView, battleView, gameCtx, battleCtx) {
        if (!this.playerMoved()) return false;
        if (this.isEncounter()) {
            const battle = await this.startEncounter(gameView, battleView, gameCtx, battleCtx);
            return battle;
        }
        
        return false;
    }
    
    performFadeEffect(gameView, callback) {
        this.isFading = true;
        this.fadeDirection = 'in';
        this.fadeOpacity = 0;
        this.fadeStartTime = performance.now();
        
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
        
        const animate = (timestamp) => {
            if (!this.isFading) {
                document.body.removeChild(fadeOverlay);
                return;
            }
            
            const elapsed = timestamp - this.fadeStartTime;
            const progress = Math.min(elapsed / this.fadeDuration, 1);
            
            if (this.fadeDirection === 'in') {
                this.fadeOpacity = progress;
                fadeOverlay.style.opacity = this.fadeOpacity.toString();
                
                if (progress >= 1) {
                    this.fadeDirection = 'out';
                    this.fadeStartTime = performance.now();
                    callback();
                }
            } else {
                this.fadeOpacity = 1 - progress;
                fadeOverlay.style.opacity = this.fadeOpacity.toString();
                
                if (progress >= 1) {
                    this.isFading = false;
                    document.body.removeChild(fadeOverlay);
                    return;
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    async startEncounter(gameView, battleView, gameCtx, battleCtx) {
        return new Promise(async (resolve) => {
            this.performFadeEffect(gameView, async () => {
                gameView.style.display = "none";
                battleView.style.display = "block";
                
                const playerPokemonName = await getRandomPokemon();
                const playerMon = new Pokemon(playerPokemonName);
                await playerMon.setDetails();
                playerMon.level = 50;
                playerMon.maxHealth = 120;
                playerMon.currentHP = 120;

                const wildPokemonName = await getRandomPokemon();
                const wildMon = new Pokemon(wildPokemonName);
                await wildMon.setDetails();
                wildMon.level = 45;
                wildMon.maxHealth = 110;
                wildMon.currentHP = 110;

                console.log(`Battle started: ${playerMon.name} vs ${wildMon.name}`);
                
                const battle = new Battle(playerMon, wildMon, battleCtx, this.audioManager);
                resolve(battle);
            });
        });
    }
}