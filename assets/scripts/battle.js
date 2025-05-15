import { Controls } from "./controls.js";

const pokemonFont = new FontFace('Pokemon Fire Red', 'url(./assets/fonts/poke.woff)');
    pokemonFont.load().then((font) => {
    document.fonts.add(font);
}).catch((error) => {
    console.error('Error loading font:', error);
});


export class Battle {
    constructor(playerPokemon, enemyPokemon, ctx, audioManager) {
        this.ctx = ctx;
        this.audioManager = audioManager;

        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        this.masterBackground = new Image();
        this.masterBackground.src = "./assets/textures/background.png";

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

        this.redArrow = new Image();
        this.redArrow.src = "./assets/textures/red-arrow.png";

        this.fainted = new Image();
        this.fainted.src = "./assets/textures/fainted.png";

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
        this.currentDisplayText = ["", ""];
        this.typewriterIndex = 0;
        this.typewriterSpeed = 2;
        this.typewriterDelay = 0;
        this.isTyping = false;

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
            masterBackground: false,
            background: false,
            playerPokemonHpBar: false,
            enemyPokemonHpBar: false,
            textBox: false,
            attackOptions: false,
            moveSelectionBox: false,
            arrow: false,
            redArrow: false,
            playerPokemonSprite: false,
            enemyPokemonSprite: false,
            fainted: false
        };

        this.masterBackground.onload = () => { this.imagesLoaded.masterBackground = true; };
        this.background.onload = () => { this.imagesLoaded.background = true; };
        this.playerPokemonHpBar.onload = () => { this.imagesLoaded.playerPokemonHpBar = true; };
        this.enemyPokemonHpBar.onload = () => { this.imagesLoaded.enemyPokemonHpBar = true; };
        this.textBox.onload = () => { this.imagesLoaded.textBox = true; };
        this.attackOptions.onload = () => { this.imagesLoaded.attackOptions = true; };
        this.moveSelectionBox.onload = () => { this.imagesLoaded.moveSelectionBox = true; };
        this.arrow.onload = () => { this.imagesLoaded.arrow = true; };
        this.redArrow.onload = () => { this.imagesLoaded.redArrow = true; };
        this.fainted.onload = () => { this.imagesLoaded.fainted = true; };
        
        // battle music when battle is created
        if (this.audioManager) {
            this.audioManager.playTrack('battle');
        }
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
    }

    startTypewriterEffect(text) {
        this.battleText = Array.isArray(text) ? text : [text];
        this.currentDisplayText = new Array(this.battleText.length).fill("");
        this.typewriterIndex = 0;
        this.currentBattleTextIndex = 0;
        this.isTyping = true;
    }

    updateTypewriterEffect() {
        if (!this.isTyping || this.currentBattleTextIndex >= this.battleText.length) {
            return;
        }

        this.typewriterDelay++;
        if (this.typewriterDelay < 2) {
            return;
        }
        this.typewriterDelay = 0;

        const currentText = this.battleText[this.currentBattleTextIndex];
        
        if (this.typewriterIndex < currentText.length) {
            this.currentDisplayText[this.currentBattleTextIndex] += currentText[this.typewriterIndex];
            this.typewriterIndex++;
        } else {
            if (this.controls.keys['Enter'] && !this.lastInputState.enter) {
                this.lastInputState.enter = true;
                this.currentBattleTextIndex++;
                this.typewriterIndex = 0;
                
                if (this.currentBattleTextIndex < this.battleText.length) {
                    this.currentDisplayText[this.currentBattleTextIndex] = "";
                } else {
                    this.isTyping = false;
                    if (this.currentState === this.battleStates.INTRODUCTION) {
                        this.currentState = this.battleStates.PLAYER_CHOICE;
                    }
                }
            } else if (!this.controls.keys['Enter']) {
                this.lastInputState.enter = false;
            }
        }
    }

    canProceedPastText() {
        return !this.isTyping || (this.currentBattleTextIndex < this.battleText.length && 
               this.typewriterIndex >= this.battleText[this.currentBattleTextIndex].length);
    }

    update() {
        this.updateTypewriterEffect();

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

        if (this.isTyping) {
            return;
        }

        switch(this.currentState) {
            case this.battleStates.INTRODUCTION:
                this.startTypewriterEffect([
                    `A wild ${this.enemyPokemon.name.toUpperCase()} appeared!`,
                    `Go! ${this.playerPokemon.name.toUpperCase()}!`
                ]);
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
                if (this.controls.keys['Enter'] && !this.lastInputState.enter) {
                    this.lastInputState.enter = true;
                }
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
                this.startTypewriterEffect("Got away safely! Press Space to Continue!");
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
        
        this.startTypewriterEffect(`${this.playerPokemon.name.toUpperCase()} used ${moveName}!`);
        
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
            this.startTypewriterEffect([
                `${this.playerPokemon.name.toUpperCase()} used ${moveName}!`,
                "But it had no effect!"
            ]);
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
        
        this.startTypewriterEffect(`Enemy ${this.enemyPokemon.name.toUpperCase()} used ${moveName}!`);
        
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
            this.startTypewriterEffect([
                `Enemy ${this.enemyPokemon.name.toUpperCase()} used ${moveName}!`,
                "But it had no effect!"
            ]);
            this.currentState = this.battleStates.PLAYER_CHOICE;
        }
    }
    
    checkBattleEnd() {
        if (this.playerPokemon.currentHP <= 0) {
            this.currentState = this.battleStates.DEFEAT;
            this.startTypewriterEffect([
                `${this.playerPokemon.name.toUpperCase()} fainted!`, 
                "You lost the battle!",
                "Press Space to Continue!",
            ]);
            // no music change for defeat
        } else if (this.enemyPokemon.currentHP <= 0) {
            this.currentState = this.battleStates.VICTORY;
            this.startTypewriterEffect([
                `Enemy ${this.enemyPokemon.name.toUpperCase()} fainted!`, 
                "You won the battle!",
                "Press Space to Continue!",
            ]);
            // victory
            if (this.audioManager) {
                this.audioManager.playTrack('victory');
            }
        } else {
            if (this.damagedPokemon === this.enemyPokemon) {
                this.currentState = this.battleStates.ENEMY_CHOICE;
            } else {
                this.currentState = this.battleStates.PLAYER_CHOICE;
            }
        }
    }
    draw(ctx) {
        // const height = ctx.canvas.height;
        // const width = height * 1.5; // battle view has a ratio of 3:2 == 1.5
        const xOffset = (ctx.canvas.width - 960) / 2;
        const yOffset =  0; // (ctx.canvas.height - 640) / 2;


        if (this.imagesLoaded.background) {
            ctx.drawImage(this.background, xOffset, yOffset, 960, 640);
        }

        if (this.enemyPokemon.spritesLoaded.front) {
            this.imagesLoaded.enemyPokemonSprite = true;
            const spriteScale = 3;
            const spriteWidth = this.enemyPokemon.spriteImageFront.width * spriteScale;
            const spriteHeight = this.enemyPokemon.spriteImageFront.height * spriteScale;
            const shouldHideForDamage = this.damageAnimationActive && 
                                      this.damagedPokemon === this.enemyPokemon && 
                                      this.animationTimer % 8 < 4;
            
            if (!shouldHideForDamage) {
                ctx.drawImage(
                    this.enemyPokemon.spriteImageFront,
                    this.enemyPosition.x - spriteWidth / 2 + xOffset,
                    this.enemyPosition.y - spriteHeight / 2 + yOffset,
                    spriteWidth,
                    spriteHeight
                );
                
                // draw fainted icon over enemy Pokemon if it has fainted
                if (this.imagesLoaded.fainted && this.enemyPokemon.currentHP <= 0) {
                    ctx.drawImage(
                        this.fainted,
                        this.enemyPosition.x - 50 + xOffset,
                        this.enemyPosition.y - 50 + yOffset,
                        33 * 3,
                        33 * 3
                    );
                }
            }
        }

        if (this.playerPokemon.spritesLoaded.back) {
            this.imagesLoaded.playerPokemonSprite = true;
            const spriteScale = 3;
            const spriteWidth = this.playerPokemon.spriteImageBack.width * spriteScale;
            const spriteHeight = this.playerPokemon.spriteImageBack.height * spriteScale;
            const shouldHideForDamage = this.damageAnimationActive && 
                                      this.damagedPokemon === this.playerPokemon && 
                                      this.animationTimer % 8 < 4;
            
            if (!shouldHideForDamage) {
                ctx.drawImage(
                    this.playerPokemon.spriteImageBack,
                    this.playerPosition.x - spriteWidth / 2 + xOffset,
                    this.playerPosition.y - spriteHeight / 2 + yOffset,
                    spriteWidth,
                    spriteHeight
                );
                
                // draw fainted icon over player Pokemon if it has fainted
                if (this.imagesLoaded.fainted && this.playerPokemon.currentHP <= 0) {
                    ctx.drawImage(
                        this.fainted,
                        this.playerPosition.x - 50 + xOffset,
                        this.playerPosition.y - 50 + yOffset,
                        33 * 3,
                        33 * 3
                    );
                }
            }
        }

        // enemy hp
        if (this.imagesLoaded.enemyPokemonHpBar) {
            ctx.drawImage(
                this.enemyPokemonHpBar,
                56 + xOffset,
                68 + yOffset,
                400,
                120
            );
            
            // enemy name
            
            ctx.font = '1.5rem pokemonFont';
            ctx.fillStyle = 'black';
            ctx.fillText(this.enemyPokemon.name.toUpperCase(), 90 + xOffset, 110 + yOffset);
            // hp bar
            if (this.enemyPokemon.currentHP !== undefined && this.enemyPokemon.maxHealth) {
                const hpPercentage = Math.max(0, this.enemyPokemon.currentHP) / this.enemyPokemon.maxHealth;
                const barWidth = 192 * hpPercentage;
                
                ctx.fillStyle = hpPercentage > 0.5 ? "green" : hpPercentage > 0.2 ? "orange" : "red";
                ctx.fillRect(212 + xOffset, 140 + yOffset, barWidth, 10);
            }
        }

        if (this.imagesLoaded.playerPokemonHpBar) {
            ctx.drawImage(
                this.playerPokemonHpBar,
                500 + xOffset,
                491 + yOffset,
                416,
                150
            );
            
            ctx.font = '24px pokemonFont';
            ctx.fillStyle = 'black';
            ctx.fillText(this.playerPokemon.name.toUpperCase(), 570 + xOffset, 528 + yOffset);
            
            if (this.playerPokemon.currentHP !== undefined && this.playerPokemon.maxHealth) {
                const hpPercentage = Math.max(0, this.playerPokemon.currentHP) / this.playerPokemon.maxHealth;
                const barWidth = 192 * hpPercentage;
                
                ctx.fillStyle = hpPercentage > 0.5 ? "green" : hpPercentage > 0.2 ? "orange" : "red";
                ctx.fillRect(700 + xOffset, 562, barWidth, 10);
            }
        }

        if (this.currentState === this.battleStates.MOVE_SELECTION) {
            // move selection box, need to mark the positions appropriately
            if (this.imagesLoaded.moveSelectionBox) {
                ctx.drawImage(
                    this.moveSelectionBox,
                    xOffset,
                    641 + yOffset,
                    960,
                    204
                );
                
                ctx.font = '24px pokemonFont';
                ctx.fillStyle = 'black';
                
                const moves = this.playerPokemon.formattedMoves;
                const movePositions = [
                    { x: 170, y: 720 },
                    { x: 550, y: 720 },
                    { x: 170, y: 780 },
                    { x: 550, y: 780 }
                ];
                
                for (let i = 0; i < Math.min(4, moves.length); i++) {
                    const moveName = moves[i].name
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                        
                    ctx.fillText(moveName, movePositions[i].x + xOffset, movePositions[i].y + yOffset);
                }
                
                if (this.imagesLoaded.arrow) {
                    const position = this.moveArrowPositions[this.selectedMoveIndex];
                    ctx.drawImage(
                        this.arrow,
                        position.x + xOffset,
                        position.y + yOffset,
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
                    xOffset,
                    641 + yOffset,
                    960,
                    204
                );
                
                // typewriter text
                ctx.font = '24px pokemonFont';
                ctx.fillStyle = 'white';
                
                if (this.currentDisplayText[0]) {
                    ctx.fillText(this.currentDisplayText[0], 50 + xOffset, 700 + yOffset, 400);
                    
                    if (this.currentDisplayText[1]) {
                        ctx.fillText(this.currentDisplayText[1], 50 + xOffset, 730 + yOffset, 400);

                        if (this.currentDisplayText[2]) {
                            ctx.fillText(this.currentDisplayText[2], 50 + xOffset, 760 + yOffset, 400);
                        }
                    }
                }
                
                if (this.canProceedPastText() && Math.floor(Date.now() / 500) % 2 === 0) {
                    ctx.drawImage(
                        this.redArrow,
                        890 + xOffset,
                        790 + yOffset,
                        30,
                        18
                    );
                    // ctx.fillText("▼", 900 + xOffset, 800 + yOffset);
                }
            }

            if (this.currentState === this.battleStates.PLAYER_CHOICE) {
                if (this.imagesLoaded.attackOptions) {
                    ctx.drawImage(
                        this.attackOptions,
                        450 + xOffset,
                        641 + yOffset,
                        510,
                        210
                    );
                }
                
                if (this.imagesLoaded.arrow) {
                    const position = this.arrowPositions[this.selectedOption];
                    ctx.drawImage(
                        this.arrow,
                        position.x + xOffset,
                        position.y + yOffset,
                        20,
                        32
                    );
                }
            }
        }
        // audio volume control
        if (this.audioManager) {
            this.audioManager.drawUI(ctx);
        }
    }
}