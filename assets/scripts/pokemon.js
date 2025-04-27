const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon/';

export class Pokemon {
    constructor(name) {
        this.maxHealth = 100;
        this.spriteImageFront = new Image();
        this.spriteImageBack = new Image();
        this.cry = new Audio();
        this.moves = [];
        this.level = 0;

    }

    setSpriteImage(name) {
        fetch(POKEMON_API_URL + name)
        .then(response => response.json())
        .then(data => {
            this.spriteImageFront.src = data.sprites.front_default;
            this.spriteImageBack.src = data.sprites.back_default;
        })
        .catch(error => {
            console.error('error sprite:', error);
        });
        
    }

    setCry(name) {
        fetch(POKEMON_API_URL + name)
        .then(response => response.json())
        .then(data => {
            this.cry.src = data.cries.latest;
        })
        .catch(error => {
            console.error('error cry:', error);
        });

    
    }

    setMoves(name) {
        fetch(POKEMON_API_URL + name)
        .then(response => response.json())
        .then(data => {
            this.moves = data.moves;
        })
        .catch(error => {
            console.error('error cry:', error);
        });
    }
}