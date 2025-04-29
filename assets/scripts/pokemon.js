const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon/';

export class Pokemon {
    constructor(name) {
        this.name = String(name);
        this.maxHealth = 100;
        this.currentHP = 100;
        this.spriteImageFront = new Image();
        this.spriteImageBack = new Image();
        this.cry = new Audio();
        this.moves = [];
        this.formattedMoves = [];
        this.level = 0;
        this.stats = {
            attack: 0,
            defense: 0,
            special_attack: 0,
            special_defense: 0,
            speed: 0
        };
    }

    async setDetails() {
        fetch(POKEMON_API_URL + this.name)
        .then(response => response.json())
        .then(data => {
            // console.log("pokemon data", data);

            if (data.sprites.front_default === null) {
                // console.log("front is nay!")
                this.spriteImageFront.src = "./assets/textures/fallback_front.png";
            } else {
                this.spriteImageFront.src = data.sprites.front_default;
            }

            if (data.sprites.back_default === null) {
                // console.log("back is nay!")
                this.spriteImageBack.src = "./assets/textures/fallback_back.png";
            } else {
                this.spriteImageBack.src = data.sprites.back_default;
            }

            if (data.cries && data.cries.latest) {
                this.cry.src = data.cries.latest;
            }

            this.moves = data.moves.slice(0, 4);
            
            if (data.stats) {
                data.stats.forEach(stat => {
                    const statName = stat.stat.name.replace('-', '_');
                    if (this.stats.hasOwnProperty(statName)) {
                        this.stats[statName] = stat.base_stat;
                    }
                });
            }

            this.formattedMoves = this.moves.map((moveData) => {
                return {
                    name: moveData.move.name.replace('-', ' '),
                    url: moveData.move.url,
                    power: Math.floor(Math.random() * 50) + 30,
                    accuracy: Math.floor(Math.random() * 15) + 85,
                    type: 'normal'
                };
            });

            console.log(`Moves for ${this.name}:`, this.formattedMoves);
        })
        .catch(error => {
            console.error('error set:', error);
        
            this.formattedMoves = [
                { name: "tackle", power: 40, accuracy: 100, type: 'normal' },
                { name: "scratch", power: 40, accuracy: 100, type: 'normal' },
                { name: "growl", power: 0, accuracy: 100, type: 'normal' },
                { name: "leer", power: 0, accuracy: 100, type: 'normal' }
            ];
        });
    }
}

export async function getRandomPokemon() {
    const response = await fetch(POKEMON_API_URL + Math.floor(Math.random() * (1025 - 1) + 1));
    const data = await response.json();
    return data.name;
}