import { Pokemon } from "./pokemon.js";
import { Controls } from "./controls.js";

const pokemonFont = new FontFace('Pokemon Fire Red', 'url("./assets/fonts/poke.ttf")');


export class Battle {
    constructor(playerPokemon, enemyPokemon, ctx) {
        this.ctx = ctx;

        this.background = new Image();
        this.background.src = "./assets/textures/battle-background-grass.png";

        this.playerPokemonHpBar = new Image();
        this.playerPokemonHpBar.src = "./assets/textures/playerHP.png";

        this.enemyPokemonHpBar = new Image();
        this.enemyPokemonHpBar.src = "./assets/textures/opponentHP.png";

        this.textBox = new Image();
        this.textBox.src = "./assets/textures/menu-textbox.png";

        this.attackOptions = new Image();
        this.attackOptions.src = "./assets/textures/menu-attack-options.png";

        this.arrow = new Image();
        this.arrow.src = "./assets/textures/menu-arrow.png";

        this.playerPokemon = playerPokemon;
        this.enemyPokemon = enemyPokemon;

        this.controls = new Controls();
        this.battleStates = {
            INTRODUCTION: 0,
            PLAYER_CHOICE: 1,
            ENEMY_CHOICE: 2,
            RESOLVE_TURNS: 3,
            VICTORY: 4,
            DEFEAT: 5,
            RUN: 6
        };
        this.currentState = this.battleStates.INTRODUCTION;
        this.currentMenu = 'main';
        this.menuOptions = ['FIGHT', 'RUN'];
        this.selectedOption = 0; // 0 = FIGHT, 1 = RUN
        this.battleText = [];
        this.isAnimating = false;

        this.enemyPosition = { x: 700, y: 280 };
        this.playerPosition = { x: 250, y: 580 };

        this.arrowPositions = [
            { x: 510, y: 732 },
            { x: 752, y: 732 }
        ];

        this.lastInputState = {
            right: false,
            left: false
        };

        this.initializePokemon();

        this.imagesLoaded = {
            background: false,
            playerPokemonHpBar: false,
            enemyPokemonHpBar: false,
            textBox: false,
            attackOptions: false,
            arrow: false,
            playerPokemonSprite: false,
            enemyPokemonSprite: false
        };

        this.background.onload = () => { this.imagesLoaded.background = true; };
        this.playerPokemonHpBar.onload = () => { this.imagesLoaded.playerPokemonHpBar = true; };
        this.enemyPokemonHpBar.onload = () => { this.imagesLoaded.enemyPokemonHpBar = true; };
        this.textBox.onload = () => { this.imagesLoaded.textBox = true; };
        this.attackOptions.onload = () => { this.imagesLoaded.attackOptions = true; };
        this.arrow.onload = () => { this.imagesLoaded.arrow = true; };
        
        this.playerPokemon.spriteImageBack.onload = () => { 
            this.imagesLoaded.playerPokemonSprite = true; 
        };
        this.enemyPokemon.spriteImageFront.onload = () => { 
            this.imagesLoaded.enemyPokemonSprite = true; 
        };
    }

    initializePokemon() {
        this.playerPokemon.currentHP = this.playerPokemon.health;
        this.enemyPokemon.currentHP = this.enemyPokemon.health;
        
        setTimeout(() => {
            if (this.enemyPokemon.cry.src) {
                this.enemyPokemon.cry.play().catch(e => console.log("Audio play error:", e));
            }
        }, 1000);
    }

    update() {
        if (this.isAnimating) return;

        switch(this.currentState) {
            case this.battleStates.INTRODUCTION:
                this.battleText = [`A wild ${this.enemyPokemon.name} appeared!`];
                this.battleText.push(`Go! ${this.playerPokemon.name}!`);
                this.currentState = this.battleStates.PLAYER_CHOICE;
                break;

            case this.battleStates.PLAYER_CHOICE:
                this.handleMenuInput();
                break;

            case this.battleStates.ENEMY_CHOICE:
                this.enemyAttack();
                break;

            case this.battleStates.RESOLVE_TURNS:
                this.resolveTurn();
                break;

            case this.battleStates.VICTORY:
            case this.battleStates.DEFEAT:
            case this.battleStates.RUN:
                break;
        }
    }

    handleMenuInput() {
        if ((this.controls.keys['ArrowRight'] || this.controls.keys['d']) && 
            !this.lastInputState.right) {
            this.selectedOption = 1;
            this.lastInputState.right = true;
        } else if (!(this.controls.keys['ArrowRight'] || this.controls.keys['d'])) {
            this.lastInputState.right = false;
        }

        if ((this.controls.keys['ArrowLeft'] || this.controls.keys['a']) && 
            !this.lastInputState.left) {
            this.selectedOption = 0;
            this.lastInputState.left = true;
        } else if (!(this.controls.keys['ArrowLeft'] || this.controls.keys['a'])) {
            this.lastInputState.left = false;
        }

        if (this.controls.keys['Enter']) {
            if (this.selectedOption === 0) {
                // this.currentState = this.battleStates.RESOLVE_TURNS;
                console.log("FIGHT selected");
            } else {
                // this.currentState = this.battleStates.RUN;
                console.log("RUN selected");
            }
        }
    }

    draw(ctx) {
        if (this.imagesLoaded.background) {
            ctx.drawImage(this.background, 0, 0, (ctx.canvas.width+960)/2, 640);
        }

        // enemy pokemon sprite
        if (this.imagesLoaded.enemyPokemonSprite) {
            const spriteScale = 3;
            const spriteWidth = this.enemyPokemon.spriteImageFront.width * spriteScale;
            const spriteHeight = this.enemyPokemon.spriteImageFront.height * spriteScale;
            
            ctx.drawImage(
                this.enemyPokemon.spriteImageFront,
                this.enemyPosition.x - spriteWidth / 2,
                this.enemyPosition.y - spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
        }

        // player pokemon sprite
        if (this.imagesLoaded.playerPokemonSprite) {
            const spriteScale = 3;
            const spriteWidth = this.playerPokemon.spriteImageBack.width * spriteScale;
            const spriteHeight = this.playerPokemon.spriteImageBack.height * spriteScale;
            
            ctx.drawImage(
                this.playerPokemon.spriteImageBack,
                this.playerPosition.x - spriteWidth / 2,
                this.playerPosition.y - spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
        }

        // enemy hp
        if (this.imagesLoaded.enemyPokemonHpBar) {
            ctx.drawImage(
                this.enemyPokemonHpBar,
                56,
                68,
                400,
                120
            );
            
            
            // hp bar
            if (this.enemyPokemon.currentHP !== undefined && this.enemyPokemon.maxHealth) {
                const hpPercentage = this.enemyPokemon.currentHP / this.enemyPokemon.maxHealth;
                const barWidth = 192 * hpPercentage;
                
                ctx.fillStyle = hpPercentage > 0.5 ? "green" : hpPercentage > 0.2 ? "orange" : "red";
                ctx.fillRect(212, 140, barWidth, 10);
            }
        }

        // player hp
        if (this.imagesLoaded.playerPokemonHpBar) {
            ctx.drawImage(
                this.playerPokemonHpBar,
                500,
                491,
                416,
                150
            );
            
            // hp bar
            if (this.playerPokemon.currentHP !== undefined && this.playerPokemon.maxHealth) {
                const hpPercentage = this.playerPokemon.currentHP / this.playerPokemon.maxHealth;
                const barWidth = 192 * hpPercentage;
                
                ctx.fillStyle = hpPercentage > 0.5 ? "green" : hpPercentage > 0.2 ? "orange" : "red";
                ctx.fillRect(700, 562, barWidth, 10);
                
            }
        }

        // textbox
        if (this.imagesLoaded.textBox) {
            ctx.drawImage(
                this.textBox,
                0,
                641,
                960,
                204
            );
            
        }

        // attack options fight or run
        if (this.imagesLoaded.attackOptions) {
            ctx.drawImage(
                this.attackOptions,
                450,
                641,
                510,
                210
            );
            
        }

        if (this.imagesLoaded.arrow) {
            const position = this.arrowPositions[this.selectedOption];
            ctx.drawImage(
                this.arrow,
                position.x,
                position.y,
                20,
                32
            );
        }
    }

    enemyAttack() {
        console.log("Enemy is attacking");
        this.currentState = this.battleStates.RESOLVE_TURNS;
    }

    resolveTurn() {
        console.log("Resolving turn");
        this.currentState = this.battleStates.PLAYER_CHOICE;
    }
}