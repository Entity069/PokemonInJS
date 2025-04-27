import { Pokemon } from "./pokemon.js";
import { Controls } from "./controls.js";

export class Battle {
    constructor(playerPokemon, enemyPokemon) {
        this.background = new Image();
        this.background.src = "./assets/textures/battle-background-grass.png";

        this.playerPokemonHpBar = new Image();
        this.playerPokemonHpBar.src = "./assets/textures/playerHP.png";

        this.enemyPokemonHpBar = new Image();
        this.enemyPokemonHpBar.src = "./assets/textures/opponentHP.png";

        this.textBox = new Image();
        this.textBox.src = "./assets/textures/menu-textbox.png";

        this.attackOptions = new Image();
        this.attackOptions.src = "./assets/textures/menu-attack-options-2.png";

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
        this.menuOptions = ['FIGHT', 'BAG', 'POKéMON', 'RUN'];
        this.selectedOption = 0;
        this.battleText = [];
        this.isAnimating = false;

        this.enemyPosition = { x: 1000, y: 200 };
        this.playerPosition = { x: 400, y: 600 };
        this.HPBarWidth = 200;

        this.initializePokemon();
    }

    initializePokemon() {
        this.playerPokemon.currentHP = this.playerPokemon.health;
        this.enemyPokemon.currentHP = this.enemyPokemon.health;
    }

    update() {
        if (this.isAnimating) return;

        switch(this.currentState) {
            case this.battleStates.INTRODUCTION:
                this.battleText = [`A trainer wants to battle!`];
                this.battleText.push(`${this.enemyPokemon.name} appeared!`);
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

    draw(ctx) {
        ctx.clearRect(0, 0, 1920, 1200);
        
        ctx.drawImage(this.background, 0, 0, 1920, 1200);
        
        this.drawPokemon(ctx);
        
        this.drawHPBars(ctx);
        
        this.drawBattleText(ctx);
        
        if (this.currentState === this.battleStates.PLAYER_CHOICE) {
            this.drawMenu(ctx);
        }
    }

    drawPokemon(ctx) {
        // enemy
        if (this.enemyPokemon.spriteImageFront.complete) {
            ctx.drawImage(
                this.enemyPokemon.spriteImageFront,
                this.enemyPosition.x,
                this.enemyPosition.y,
                300,
                300
            );
        }

        // plaeyr
        if (this.playerPokemon.spriteImageBack.complete) {
            ctx.drawImage(
                this.playerPokemon.spriteImageBack,
                this.playerPosition.x,
                this.playerPosition.y,
                300,
                300
            );
        }
    }

    drawHPBars(ctx) {
        // enemy
        ctx.fillStyle = '#444';
        ctx.fillRect(this.enemyPosition.x + 50, this.enemyPosition.y - 40, this.HPBarWidth, 20);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(
            this.enemyPosition.x + 50,
            this.enemyPosition.y - 40,
            (this.enemyPokemon.currentHP / this.enemyPokemon.health) * this.HPBarWidth,
            20
        );

        // player
        ctx.fillStyle = '#444';
        ctx.fillRect(this.playerPosition.x - 200, this.playerPosition.y + 250, this.HPBarWidth, 20);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(
            this.playerPosition.x - 200,
            this.playerPosition.y + 250,
            (this.playerPokemon.currentHP / this.playerPokemon.health) * this.HPBarWidth,
            20
        );
    }

    drawBattleText(ctx) {
        if (this.battleText.length > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(100, 800, 1720, 200);
            
            ctx.fillStyle = 'white';
            ctx.font = '32px Arial';
            this.battleText.forEach((text, index) => {
                ctx.fillText(text, 150, 860 + (index * 40));
            });
        }
    }

    drawMenu(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(1000, 800, 800, 200);
        
        this.menuOptions.forEach((option, index) => {
            ctx.fillStyle = this.selectedOption === index ? '#FFD700' : 'white';
            ctx.font = '32px Arial';
            ctx.fillText(option, 1050 + (index % 2) * 400, 860 + Math.floor(index / 2) * 60);
        });
    }

}
