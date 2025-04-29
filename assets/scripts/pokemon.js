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

export class PokemonSelector {
    constructor(player, audioManager) {
        this.player = player;
        this.audioManager = audioManager;
        this.selectedPokemon = null;
        this.isOpen = false;
        this.pokemonList = [];
        this.modalContainer = null;
        this.createModal();
        this.setupKeyListener();
    }
    
    setupKeyListener() {
        window.addEventListener('keydown', async (e) => {
            if ((e.code === 'KeyX' || e.key === 'x' || e.key === 'X') && !this.isOpen) {
                this.openModal();
            }
        });
    }
    
    createModal() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'pokemon-select-modal';
        this.modalContainer.style.display = 'none';
        this.modalContainer.style.position = 'absolute';
        this.modalContainer.style.top = '50%';
        this.modalContainer.style.left = '50%';
        this.modalContainer.style.transform = 'translate(-50%, -50%)';
        this.modalContainer.style.backgroundColor = '#f8f8f8';
        this.modalContainer.style.border = '4px solid #3c5aa6'; // Pokémon blue border
        this.modalContainer.style.borderRadius = '10px';
        this.modalContainer.style.padding = '20px';
        this.modalContainer.style.zIndex = '1001';
        this.modalContainer.style.width = '600px';
        this.modalContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        
        const title = document.createElement('h2');
        title.textContent = 'Select Your Pokémon';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        title.style.color = '#3c5aa6';
        title.style.fontFamily = 'sans-serif';
        this.modalContainer.appendChild(title);
        
        const gridContainer = document.createElement('div');
        gridContainer.id = 'pokemon-grid';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        gridContainer.style.gridTemplateRows = 'repeat(3, 1fr)';
        gridContainer.style.gap = '10px';
        this.modalContainer.appendChild(gridContainer);
        
        document.body.appendChild(this.modalContainer);
    }
    
    async fetchRandomPokemon() {
        this.pokemonList = [];
        
        const loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = 'Loading Pokémon...';
        loadingIndicator.style.textAlign = 'center';
        loadingIndicator.style.padding = '50px';
        loadingIndicator.style.fontSize = '18px';
        this.modalContainer.querySelector('#pokemon-grid').appendChild(loadingIndicator);
        
        try {
            const uniqueIds = new Set();
            while (uniqueIds.size < 12) {
                uniqueIds.add(Math.floor(Math.random() * 1025) + 1);
            }
            const promises = Array.from(uniqueIds).map(async (id) => {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                    if (!response.ok) throw new Error(`Failed to fetch Pokémon #${id}`);
                    const data = await response.json();
                    
                    return {
                        id: data.id,
                        name: data.name,
                        sprite: data.sprites.front_default || './assets/textures/fallback_front.png'
                    };
                } catch (error) {
                    console.error(`Error fetching Pokémon #${id}:`, error);
                    return {
                        id: id,
                        name: `unknown-${id}`,
                        sprite: './assets/textures/fallback_front.png'
                    };
                }
            });
            
            this.pokemonList = await Promise.all(promises);
        } catch (error) {
            console.error('Error fetching random Pokémon:', error);
        } finally {
            const gridContainer = this.modalContainer.querySelector('#pokemon-grid');
            gridContainer.innerHTML = '';
            
            this.populateGrid();
        }
    }
    
    populateGrid() {
        const gridContainer = this.modalContainer.querySelector('#pokemon-grid');
        
        this.pokemonList.forEach(pokemon => {
            const cell = document.createElement('div');
            cell.className = 'pokemon-cell';
            cell.style.display = 'flex';
            cell.style.flexDirection = 'column';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.padding = '10px';
            cell.style.border = '2px solid #ffcb05';
            cell.style.borderRadius = '5px';
            cell.style.cursor = 'pointer';
            cell.style.backgroundColor = '#fff';
            cell.style.transition = 'transform 0.2s, box-shadow 0.2s';
            
            cell.addEventListener('mouseover', () => {
                cell.style.transform = 'scale(1.05)';
                cell.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                cell.style.backgroundColor = '#f0f8ff';
            });
            
            cell.addEventListener('mouseout', () => {
                cell.style.transform = 'scale(1)';
                cell.style.boxShadow = 'none';
                cell.style.backgroundColor = '#fff';
            });
            
            const sprite = document.createElement('img');
            sprite.src = pokemon.sprite;
            sprite.style.width = '96px';
            sprite.style.height = '96px';
            sprite.style.imageRendering = 'pixelated';
            
            const nameLabel = document.createElement('div');
            const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
            nameLabel.textContent = capitalizedName;
            nameLabel.style.marginTop = '10px';
            nameLabel.style.fontFamily = 'sans-serif';
            nameLabel.style.fontWeight = 'bold';
            
            cell.appendChild(sprite);
            cell.appendChild(nameLabel);
            
            cell.addEventListener('click', () => {
                this.selectPokemon(pokemon);
            });
            
            gridContainer.appendChild(cell);
        });
    }
    
    async selectPokemon(pokemonData) {
        this.selectedPokemon = new Pokemon(pokemonData.name);
        await this.selectedPokemon.setDetails();
        
        this.selectedPokemon.level = 50;
        this.selectedPokemon.maxHealth = 100;
        this.selectedPokemon.currentHP = 100;
        
        console.log(`Selected Pokémon: ${this.selectedPokemon.name}`);
        
        this.closeModal();
    }
    
    async openModal() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.modalContainer.style.display = 'block';
        
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '1000';
        document.body.appendChild(overlay);
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = '#3c5aa6';
        closeButton.addEventListener('click', () => this.closeModal());
        this.modalContainer.appendChild(closeButton);
        
        await this.fetchRandomPokemon();
        
        overlay.addEventListener('click', () => this.closeModal());
    }
    
    closeModal() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.modalContainer.style.display = 'none';
        
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
        
        const closeButton = this.modalContainer.querySelector('button');
        if (closeButton) {
            this.modalContainer.removeChild(closeButton);
        }
    }
    
    getSelectedPokemon() {
        return this.selectedPokemon;
    }
}