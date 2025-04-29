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
        this.volumeOnIcon.src = './assets/textures/volume-on.svg';
        
        this.volumeOffIcon = new Image();
        this.volumeOffIcon.src = './assets/textures/volume-off.svg';
        
        this.infoBoxIcon = new Image();
        this.infoBoxIcon.src = './assets/textures/info-box.svg';
        
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
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('click', (event) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (this.isPointInRect(x, y, this.volumeButtonArea)) {
                this.toggleMusic();
            }
            
            if (this.isPointInRect(x, y, this.infoButtonArea)) {
                console.log('Info button clicked - functionality to be implemented');
            }
        });
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
        
        console.log(`Music ${this.musicEnabled ? 'enabled' : 'disabled'}`);
    }
    
    playTrack(trackName) {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }
        
        this.currentTrack = this.tracks[trackName];
        
        if (this.musicEnabled) {
            this.currentTrack.play().catch(error => {
                console.warn('audio :', error);
            });
        }
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