const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon/';

export class Pokemon {
    constructor(name) {
        this.name = String(name);
        this.maxHealth = 100;
        this.spriteImageFront = new Image();
        this.spriteImageBack = new Image();
        this.cry = new Audio();
        this.moves = [];
        this.level = 0;

    }

    async setSpriteImage() {
        fetch(POKEMON_API_URL + this.name)
        .then(response => response.json())
        .then(data => {
            this.spriteImageFront.src = data.sprites.front_default;
            this.spriteImageBack.src = data.sprites.back_default;
        })
        .catch(error => {
            console.error('error sprite:', error);
        });
        
    }

    async setCry() {
        fetch(POKEMON_API_URL + this.name)
        .then(response => response.json())
        .then(data => {
            this.cry.src = data.cries.latest;
        })
        .catch(error => {
            console.error('error cry:', error);
        });
    }

    async setMoves() {
        fetch(POKEMON_API_URL + this.name)
        .then(response => response.json())
        .then(data => {
            this.moves = data.moves;
        })
        .catch(error => {
            console.error('error cry:', error);
        });
    }
}

export async function getRandomPokemon() {
    const response = await fetch(POKEMON_API_URL + Math.floor(Math.random() * (1025 - 1) + 1));
    const data = await response.json();
    console.log(data.name)
    return data.name;
}