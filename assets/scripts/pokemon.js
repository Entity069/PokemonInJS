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
    // 1 request is better than 3
    async setDetails() {
        fetch(POKEMON_API_URL + this.name)
        .then(response => response.json())
        .then(data => {

            if (data.sprites.front_default === null) {
                console.log("front is nay!")
                this.spriteImageFront.src = "./assets/textures/fallback_front.png";
            } else {
                this.spriteImageFront.src = data.sprites.front_default;
            }

            if (data.sprites.back_default === null) {
                console.log("back is nay!")
                this.spriteImageBack.src = "./assets/textures/fallback_back.png";
            } else {
                this.spriteImageBack.src = data.sprites.back_default;
            }

            this.cry.src = data.cries.latest;
            this.moves = data.moves.slice(0, 4);
            // console.log(`Moves for ${this.name}:`, this.moves);
        })
        .catch(error => {
            console.error('error set:', error);
        });
        
    }
}

export async function getRandomPokemon() {
    const response = await fetch(POKEMON_API_URL + Math.floor(Math.random() * (1025 - 1) + 1));
    const data = await response.json();
    // console.log(data.name)
    return data.name;
}