export class AudioManager {
    constructor() {
        this.tracks = {
            overworld: new Audio('./assets/audios/celadon.mp3'),
            battle: new Audio('./assets/audios/battle.mp3'),
            victory: new Audio('./assets/audios/victory.mp3')
        };
        
        Object.values(this.tracks).forEach(track => {
            track.loop = true;
        });
        
        this.currentTrack = null;
        this.musicEnabled = true;
        
        this.volumeOnIcon = new Image();
        this.volumeOnIcon.src = './assets/textures/volume-on.png';
        
        this.volumeOffIcon = new Image();
        this.volumeOffIcon.src = './assets/textures/volume-off.png';
        
        this.infoBoxIcon = new Image();
        this.infoBoxIcon.src = './assets/textures/info-box.png';
        
        this.volumeButtonArea = {
            x: 20,
            y: 20,
            width: 40,
            height: 40
        };
        
        this.infoButtonArea = {
            x: 80,
            y: 20,
            width: 40,
            height: 40
        };
        
        this.infoModal = null;
        this.createInfoModal();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('click', (event) => {
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (this.isPointInRect(x, y, this.volumeButtonArea)) {
                this.toggleMusic();
            }
            
            if (this.isPointInRect(x, y, this.infoButtonArea)) {
                this.toggleInfoModal();
            }
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
                this.toggleMusic();
            }
            
            if (e.code === 'KeyI' || e.key === 'i' || e.key === 'I') {
                this.toggleInfoModal();
            }
        });
    }
    
    createInfoModal() {
        this.infoModal = document.createElement('div');
        this.infoModal.id = 'info-modal';
        this.infoModal.style.display = 'none';
        this.infoModal.style.position = 'absolute';
        this.infoModal.style.top = '50%';
        this.infoModal.style.left = '50%';
        this.infoModal.style.transform = 'translate(-50%, -50%)';
        this.infoModal.style.backgroundColor = '#f8f8f8';
        this.infoModal.style.border = '4px solid #3c5aa6';
        this.infoModal.style.borderRadius = '0.625rem';
        this.infoModal.style.padding = '1.25rem';
        this.infoModal.style.zIndex = '1001';
        this.infoModal.style.width = '37.5rem';
        this.infoModal.style.maxHeight = '80vh';
        this.infoModal.style.overflowY = 'auto';
        this.infoModal.style.boxShadow = '0 0 1.25rem rgba(0, 0, 0, 0.5)';
        
        const title = document.createElement('h2');
        title.textContent = 'Game Controls & Info';
        title.style.textAlign = 'center';
        title.style.marginBottom = '1.25rem';
        title.style.color = '#3c5aa6';
        title.style.fontFamily = '"Pokemon Fire Red", sans-serif';
        title.style.fontSize = '2rem';
        
        const controlsList = document.createElement('div');
        controlsList.style.fontFamily = '"Pokemon Fire Red", sans-serif';
        controlsList.style.fontSize = '1.5rem';
        controlsList.style.lineHeight = '1.6';
        
        const controls = [
            { key: 'W, A, S, D', description: 'Move the player character' },
            { key: 'X', description: 'Open Pokemon selection menu (near Pokemon Center)' },
            { key: 'M', description: 'Toggle game music' },
            { key: 'I', description: 'Toggle this info box' },
            { key: 'Space', description: 'End battle after victory/defeat' },
            { key: 'Enter', description: 'Confirm selection in battle' },
            // { key: 'Escape', description: 'End battle (debug)' },
            // { key: 'J', description: 'Toggle debug mode' }
        ];
        
        controls.forEach(control => {
            const controlItem = document.createElement('div');
            controlItem.style.display = 'flex';
            controlItem.style.marginBottom = '0.625rem';
            
            const keyElement = document.createElement('strong');
            keyElement.textContent = control.key;
            keyElement.style.minWidth = '9.375rem';
            keyElement.style.color = '#e63900';
            
            const descElement = document.createElement('span');
            descElement.textContent = control.description;
            
            controlItem.appendChild(keyElement);
            controlItem.appendChild(descElement);
            controlsList.appendChild(controlItem);
        });
        
        const gameInfo = document.createElement('div');
        gameInfo.style.marginTop = '1.875rem';
        gameInfo.style.fontFamily = '"Pokemon Fire Red", sans-serif';
        gameInfo.style.fontSize = '1.5rem';
        gameInfo.style.lineHeight = '1.6';
        
        const gameInfoTitle = document.createElement('h3');
        gameInfoTitle.textContent = 'Game Information';
        gameInfoTitle.style.color = '#3c5aa6';
        gameInfoTitle.style.marginBottom = '0.625rem';
        gameInfoTitle.style.fontSize = '2rem';
        
        const gameInfoText = document.createElement('p');
        gameInfoText.innerHTML = `
            Go to the nearent Pokemon Center to choose your Pokemon.
            After that you can start your adventure.
            Wander in the open area to check for wild Pokemons
        `;
        gameInfoText.style.marginBottom = '1rem';
        
        gameInfo.appendChild(gameInfoTitle);
        gameInfo.appendChild(gameInfoText);
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '0.625rem';
        closeButton.style.right = '0.625rem';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.fontSize = '1.5rem';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = '#3c5aa6';
        closeButton.addEventListener('click', () => this.closeInfoModal());
        
        this.infoModal.appendChild(title);
        this.infoModal.appendChild(controlsList);
        this.infoModal.appendChild(gameInfo);
        this.infoModal.appendChild(closeButton);
        
        document.body.appendChild(this.infoModal);
    }
    
    toggleInfoModal() {
        if (this.infoModal.style.display === 'none') {
            this.openInfoModal();
        } else {
            this.closeInfoModal();
        }
    }
    
    openInfoModal() {
        this.infoModal.style.display = 'block';
        
        const overlay = document.createElement('div');
        overlay.id = 'info-modal-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '1000';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => this.closeInfoModal());
    }
    
    closeInfoModal() {
        this.infoModal.style.display = 'none';
        
        const overlay = document.getElementById('info-modal-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }
    
    isPointInRect(x, y, rect) {
        return (x >= rect.x && 
                x <= rect.x + rect.width && 
                y >= rect.y && 
                y <= rect.y + rect.height);
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled && this.currentTrack) {
            this.currentTrack.play();
        } else if (!this.musicEnabled && this.currentTrack) {
            this.currentTrack.pause();
        }
    }
    
    playTrack(trackName) {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }
        
        this.currentTrack = this.tracks[trackName];
    }
    
    stopAll() {
        Object.values(this.tracks).forEach(track => {
            track.pause();
            track.currentTime = 0;
        });
        this.currentTrack = null;
    }
    
    drawUI(ctx) {
        if (this.musicEnabled) {
            ctx.drawImage(this.volumeOnIcon, 
                this.volumeButtonArea.x, 
                this.volumeButtonArea.y, 
                this.volumeButtonArea.width, 
                this.volumeButtonArea.height);
        } else {
            ctx.drawImage(this.volumeOffIcon, 
                this.volumeButtonArea.x, 
                this.volumeButtonArea.y, 
                this.volumeButtonArea.width, 
                this.volumeButtonArea.height);
        }
        
        ctx.drawImage(this.infoBoxIcon, 
            this.infoButtonArea.x, 
            this.infoButtonArea.y, 
            this.infoButtonArea.width, 
            this.infoButtonArea.height);
    }
}