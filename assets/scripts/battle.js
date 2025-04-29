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

        this.moveSelectionBox = new Image();
        this.moveSelectionBox.src = "./assets/textures/white-textbox.png";

        this.arrow = new Image();
        this.arrow.src = "./assets/textures/menu-arrow.png";

        this.playerPokemon = playerPokemon;
        this.enemyPokemon = enemyPokemon;

        this.controls = new Controls();
        this.battleStates = {
            INTRODUCTION: 0,
            PLAYER_CHOICE: 1,
            MOVE_SELECTION: 2,
            ENEMY_CHOICE: 3,
            PLAYER_ATTACK: 4,
            ENEMY_ATTACK: 5,
            CHECK_BATTLE_END: 6,
            VICTORY: 7,
            DEFEAT: 8,
            RUN: 9
        };
        this.currentState = this.battleStates.INTRODUCTION;
        this.currentMenu = 'main';
        this.menuOptions = ['FIGHT', 'RUN'];
        this.selectedOption = 0; // 0 = FIGHT, 1 = RUN
        this.selectedMoveIndex = 0;
        this.battleText = [];
        this.currentBattleTextIndex = 0;
        this.isAnimating = false;
        this.animationTimer = 0;
        this.damageAnimationActive = false;
        this.damagedPokemon = null;
        this.hpAnimationActive = false;
        this.targetHP = 0;

        this.enemyPosition = { x: 700, y: 280 };
        this.playerPosition = { x: 250, y: 580 };

        this.arrowPositions = [
            { x: 510, y: 732 },
            { x: 752, y: 732 }
        ];
        
        this.moveArrowPositions = [];

        this.lastInputState = {
            right: false,
            left: false,
            up: false,
            down: false,
            enter: false
        };

        this.setupMoves();
        this.initializePokemon();

        this.imagesLoaded = {
            background: false,
            playerPokemonHpBar: false,
            enemyPokemonHpBar: false,
            textBox: false,
            attackOptions: false,
            moveSelectionBox: false,
            arrow: false,
            playerPokemonSprite: false,
            enemyPokemonSprite: false
        };

        this.background.onload = () => { this.imagesLoaded.background = true; };
        this.playerPokemonHpBar.onload = () => { this.imagesLoaded.playerPokemonHpBar = true; };
        this.enemyPokemonHpBar.onload = () => { this.imagesLoaded.enemyPokemonHpBar = true; };
        this.textBox.onload = () => { this.imagesLoaded.textBox = true; };
        this.attackOptions.onload = () => { this.imagesLoaded.attackOptions = true; };
        this.moveSelectionBox.onload = () => { this.imagesLoaded.moveSelectionBox = true; };
        this.arrow.onload = () => { this.imagesLoaded.arrow = true; };
        
        this.playerPokemon.spriteImageBack.onload = () => { 
            this.imagesLoaded.playerPokemonSprite = true; 
        };
        this.enemyPokemon.spriteImageFront.onload = () => { 
            this.imagesLoaded.enemyPokemonSprite = true; 
        };
    }

    setupMoves() {
        const baseX = 130;
        const baseY = 700;
        const xOffset = 380;
        const yOffset = 60;

        this.moveArrowPositions = [
            { x: baseX, y: baseY },
            { x: baseX + xOffset, y: baseY },
            { x: baseX, y: baseY + yOffset },
            { x: baseX + xOffset, y: baseY + yOffset }
        ];
    }

    initializePokemon() {
        this.playerPokemon.currentHP = this.playerPokemon.maxHealth;
        this.enemyPokemon.currentHP = this.enemyPokemon.maxHealth;
        
        if (this.playerPokemon.moves.length > 0) {
            this.playerPokemon.formattedMoves = this.playerPokemon.moves.map(moveData => {
                return {
                    name: moveData.move.name.replace('-', ' '),
                    url: moveData.move.url,
                    power: Math.floor(Math.random() * 30) + 20,
                    accuracy: 95 
                };
            });
        } else {
            this.playerPokemon.formattedMoves = [
                { name: "tackle", power: 40, accuracy: 100 },
                { name: "scratch", power: 40, accuracy: 100 },
                { name: "growl", power: 0, accuracy: 100 },
                { name: "leer", power: 0, accuracy: 100 }
            ];
        }

        if (this.enemyPokemon.moves.length > 0) {
            this.enemyPokemon.formattedMoves = this.enemyPokemon.moves.map(moveData => {
                return {
                    name: moveData.move.name.replace('-', ' '),
                    url: moveData.move.url,
                    power: Math.floor(Math.random() * 30) + 20,
                    accuracy: 95 
                };
            });
        } else {
            this.enemyPokemon.formattedMoves = [
                { name: "tackle", power: 40, accuracy: 100 },
                { name: "scratch", power: 40, accuracy: 100 },
                { name: "growl", power: 0, accuracy: 100 },
                { name: "leer", power: 0, accuracy: 100 }
            ];
        }
        
        setTimeout(() => {
            if (this.enemyPokemon.cry.src) {
                this.enemyPokemon.cry.play().catch(e => console.log("Audio play error:", e));
            }
        }, 1000);
    }

    update() {
        if (this.isAnimating) {
            this.animationTimer++;
            
            if (this.hpAnimationActive) {
                const pokemon = this.damagedPokemon;
                
                if (pokemon.currentHP > this.targetHP) {
                    pokemon.currentHP = Math.max(this.targetHP, pokemon.currentHP - 1);
                } else {
                    this.hpAnimationActive = false;
                    
                    if (!this.damageAnimationActive) {
                        this.isAnimating = false;
                        this.currentState = this.battleStates.CHECK_BATTLE_END;
                    }
                }
            }
            
            if (this.damageAnimationActive) {
                if (this.animationTimer >= 40) { 
                    this.damageAnimationActive = false;
                    this.animationTimer = 0;
                    
                    if (!this.hpAnimationActive) {
                        this.isAnimating = false;
                        this.currentState = this.battleStates.CHECK_BATTLE_END;
                    }
                }
            }
            
            return;
        }

        switch(this.currentState) {
            case this.battleStates.INTRODUCTION:
                this.battleText = [`A wild ${this.enemyPokemon.name.toUpperCase()} appeared!`];
                this.battleText.push(`Go! ${this.playerPokemon.name.toUpperCase()}!`);
                this.currentState = this.battleStates.PLAYER_CHOICE;
                break;

            case this.battleStates.PLAYER_CHOICE:
                this.handleMenuInput();
                break;
                
            case this.battleStates.MOVE_SELECTION:
                this.handleMoveSelection();
                break;

            case this.battleStates.PLAYER_ATTACK:
                this.executePlayerAttack();
                break;

            case this.battleStates.ENEMY_CHOICE:
                this.chooseEnemyMove();
                break;
                
            case this.battleStates.ENEMY_ATTACK:
                this.executeEnemyAttack();
                break;
                
            case this.battleStates.CHECK_BATTLE_END:
                this.checkBattleEnd();
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

        if (this.controls.keys['Enter'] && !this.lastInputState.enter) {
            this.lastInputState.enter = true;
            
            if (this.selectedOption === 0) { // FIGHT
                this.currentState = this.battleStates.MOVE_SELECTION;
                this.selectedMoveIndex = 0;
            } else { // RUN
                this.currentState = this.battleStates.RUN;
                this.battleText = ["Got away safely!"];
            }
        } else if (!this.controls.keys['Enter']) {
            this.lastInputState.enter = false;
        }
    }
    
    handleMoveSelection() {
        const numMoves = Math.min(4, this.playerPokemon.formattedMoves.length);
        
        if ((this.controls.keys['ArrowDown'] || this.controls.keys['s']) && 
            !this.lastInputState.down) {
            if (this.selectedMoveIndex < 2) {
                if (this.selectedMoveIndex + 2 < numMoves) {
                    this.selectedMoveIndex += 2;
                }
            }
            this.lastInputState.down = true;
        } else if (!(this.controls.keys['ArrowDown'] || this.controls.keys['s'])) {
            this.lastInputState.down = false;
        }

        if ((this.controls.keys['ArrowUp'] || this.controls.keys['w']) && 
            !this.lastInputState.up) {
            if (this.selectedMoveIndex >= 2) {
                this.selectedMoveIndex -= 2;
            }
            this.lastInputState.up = true;
        } else if (!(this.controls.keys['ArrowUp'] || this.controls.keys['w'])) {
            this.lastInputState.up = false;
        }
        
        if ((this.controls.keys['ArrowRight'] || this.controls.keys['d']) && 
            !this.lastInputState.right) {
            if (this.selectedMoveIndex % 2 === 0 && this.selectedMoveIndex + 1 < numMoves) {
                this.selectedMoveIndex += 1;
            }
            this.lastInputState.right = true;
        } else if (!(this.controls.keys['ArrowRight'] || this.controls.keys['d'])) {
            this.lastInputState.right = false;
        }

        if ((this.controls.keys['ArrowLeft'] || this.controls.keys['a']) && 
            !this.lastInputState.left) {
            if (this.selectedMoveIndex % 2 === 1) {
                this.selectedMoveIndex -= 1;
            }
            this.lastInputState.left = true;
        } else if (!(this.controls.keys['ArrowLeft'] || this.controls.keys['a'])) {
            this.lastInputState.left = false;
        }

        if (this.controls.keys['Enter'] && !this.lastInputState.enter) {
            if (this.selectedMoveIndex < numMoves) {
                this.lastInputState.enter = true;
                this.currentState = this.battleStates.PLAYER_ATTACK;
            }
        } else if (!this.controls.keys['Enter']) {
            this.lastInputState.enter = false;
        }
        
        if (this.controls.keys['Escape']) {
            this.currentState = this.battleStates.PLAYER_CHOICE;
        }
    }
    
    executePlayerAttack() {
        const selectedMove = this.playerPokemon.formattedMoves[this.selectedMoveIndex];
        const moveName = selectedMove.name.toUpperCase();
        const movePower = selectedMove.power;
        
        this.battleText = [`${this.playerPokemon.name.toUpperCase()} used ${moveName}!`];
        
        if (movePower > 0) {
            const attackStat = this.playerPokemon.level * 2;
            const defenseStat = this.enemyPokemon.level * 1.5;
            
            let damage = Math.floor(((2 * this.playerPokemon.level / 5 + 2) * movePower * (attackStat / defenseStat) / 50) + 2);
            
            damage = Math.floor(damage * (0.85 + Math.random() * 0.15));
            damage = Math.max(1, damage);
            
            this.isAnimating = true;
            this.damageAnimationActive = true;
            this.hpAnimationActive = true;
            this.damagedPokemon = this.enemyPokemon;
            this.targetHP = Math.max(0, this.enemyPokemon.currentHP - damage);
            this.animationTimer = 0;
        } else {
            this.battleText.push("But it had no effect!");
            this.currentState = this.battleStates.ENEMY_CHOICE;
        }
    }

    chooseEnemyMove() {
        const availableMoves = this.enemyPokemon.formattedMoves;
        if (availableMoves.length > 0) {
            this.enemySelectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            this.currentState = this.battleStates.ENEMY_ATTACK;
        } else {
            this.enemySelectedMove = { name: "struggle", power: 20, accuracy: 100 };
            this.currentState = this.battleStates.ENEMY_ATTACK;
        }
    }
    
    executeEnemyAttack() {
        const moveName = this.enemySelectedMove.name.toUpperCase();
        const movePower = this.enemySelectedMove.power;
        
        this.battleText = [`Enemy ${this.enemyPokemon.name.toUpperCase()} used ${moveName}!`];
        
        if (movePower > 0) {
            const attackStat = this.enemyPokemon.level * 2;
            const defenseStat = this.playerPokemon.level * 1.5;
            
            let damage = Math.floor(((2 * this.enemyPokemon.level / 5 + 2) * movePower * (attackStat / defenseStat) / 50) + 2);
            
            damage = Math.floor(damage * (0.85 + Math.random() * 0.15));
            damage = Math.max(1, damage);
            
            this.isAnimating = true;
            this.damageAnimationActive = true;
            this.hpAnimationActive = true;
            this.damagedPokemon = this.playerPokemon;
            this.targetHP = Math.max(0, this.playerPokemon.currentHP - damage);
            this.animationTimer = 0;
        } else {
            this.battleText.push("But it had no effect!");
            this.currentState = this.battleStates.PLAYER_CHOICE;
        }
    }
    
    checkBattleEnd() {
        if (this.playerPokemon.currentHP <= 0) {
            this.currentState = this.battleStates.DEFEAT;
            this.battleText = [`${this.playerPokemon.name.toUpperCase()} fainted!`, "You lost the battle!"];
        } else if (this.enemyPokemon.currentHP <= 0) {
            this.currentState = this.battleStates.VICTORY;
            this.battleText = [`Enemy ${this.enemyPokemon.name.toUpperCase()} fainted!`, "You won the battle!"];
        } else {
            if (this.damagedPokemon === this.enemyPokemon) {
                this.currentState = this.battleStates.ENEMY_CHOICE;
            } else {
                this.currentState = this.battleStates.PLAYER_CHOICE;
            }
        }
    }

    draw(ctx) {
        if (this.imagesLoaded.background) {
            ctx.drawImage(this.background, 0, 0, (ctx.canvas.width+960)/2, 640);
        }

        if (this.imagesLoaded.enemyPokemonSprite) {
            const spriteScale = 3;
            const spriteWidth = this.enemyPokemon.spriteImageFront.width * spriteScale;
            const spriteHeight = this.enemyPokemon.spriteImageFront.height * spriteScale;
            const shouldHideForDamage = this.damageAnimationActive && 
                                      this.damagedPokemon === this.enemyPokemon && 
                                      this.animationTimer % 8 < 4;
            
            if (!shouldHideForDamage) {
                ctx.drawImage(
                    this.enemyPokemon.spriteImageFront,
                    this.enemyPosition.x - spriteWidth / 2,
                    this.enemyPosition.y - spriteHeight / 2,
                    spriteWidth,
                    spriteHeight
                );
            }
        }

        if (this.imagesLoaded.playerPokemonSprite) {
            const spriteScale = 3;
            const spriteWidth = this.playerPokemon.spriteImageBack.width * spriteScale;
            const spriteHeight = this.playerPokemon.spriteImageBack.height * spriteScale;
            const shouldHideForDamage = this.damageAnimationActive && 
                                      this.damagedPokemon === this.playerPokemon && 
                                      this.animationTimer % 8 < 4;
            
            if (!shouldHideForDamage) {
                ctx.drawImage(
                    this.playerPokemon.spriteImageBack,
                    this.playerPosition.x - spriteWidth / 2,
                    this.playerPosition.y - spriteHeight / 2,
                    spriteWidth,
                    spriteHeight
                );
            }
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
            
            // enemy name
            ctx.font = '24px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(this.enemyPokemon.name.toUpperCase(), 90, 110);
            
            // hp bar
            if (this.enemyPokemon.currentHP !== undefined && this.enemyPokemon.maxHealth) {
                const hpPercentage = Math.max(0, this.enemyPokemon.currentHP) / this.enemyPokemon.maxHealth;
                const barWidth = 192 * hpPercentage;
                
                ctx.fillStyle = hpPercentage > 0.5 ? "green" : hpPercentage > 0.2 ? "orange" : "red";
                ctx.fillRect(212, 140, barWidth, 10);
            }
        }

        if (this.imagesLoaded.playerPokemonHpBar) {
            ctx.drawImage(
                this.playerPokemonHpBar,
                500,
                491,
                416,
                150
            );
            
            ctx.font = '24px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(this.playerPokemon.name.toUpperCase(), 570, 528);
            
            if (this.playerPokemon.currentHP !== undefined && this.playerPokemon.maxHealth) {
                const hpPercentage = Math.max(0, this.playerPokemon.currentHP) / this.playerPokemon.maxHealth;
                const barWidth = 192 * hpPercentage;
                
                ctx.fillStyle = hpPercentage > 0.5 ? "green" : hpPercentage > 0.2 ? "orange" : "red";
                ctx.fillRect(700, 562, barWidth, 10);
            }
        }

        if (this.currentState === this.battleStates.MOVE_SELECTION) {
            // move selection box, need to mark the positions appropriately
            if (this.imagesLoaded.moveSelectionBox) {
                ctx.drawImage(
                    this.moveSelectionBox,
                    0,
                    641,
                    960,
                    204
                );
                
                ctx.font = '24px Arial';
                ctx.fillStyle = 'black';
                
                const moves = this.playerPokemon.formattedMoves;
                const movePositions = [
                    { x: 180, y: 700 },
                    { x: 560, y: 700 },
                    { x: 180, y: 760 },
                    { x: 560, y: 760 }
                ];
                
                for (let i = 0; i < Math.min(4, moves.length); i++) {
                    const moveName = moves[i].name
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                        
                    ctx.fillText(moveName, movePositions[i].x, movePositions[i].y);
                }
                
                if (this.imagesLoaded.arrow) {
                    const position = this.moveArrowPositions[this.selectedMoveIndex];
                    ctx.drawImage(
                        this.arrow,
                        position.x,
                        position.y,
                        20,
                        32
                    );
                }
            }
        } else {
            // textbox
            if (this.imagesLoaded.textBox) {
                ctx.drawImage(
                    this.textBox,
                    0,
                    641,
                    960,
                    204
                );
                
                // battle text
                ctx.font = '24px Arial';
                ctx.fillStyle = 'white';
                
                if (this.battleText.length > 0) {
                    ctx.fillText(this.battleText[0], 50, 700);
                    
                    if (this.battleText.length > 1) {
                        ctx.fillText(this.battleText[1], 50, 730);
                    }
                }
            }

            if (this.currentState === this.battleStates.PLAYER_CHOICE) {
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
        }
    }
}