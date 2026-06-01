export class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'boot' }); }

    preload() {
        // UI de carga
        const bar = this.add.graphics();
        const bg = this.add.graphics();
        bg.fillStyle(0x222233, 1);
        bg.fillRect(200, 280, 400, 20);
        const loadText = this.add.text(400, 260, 'CARGANDO...', {
            fontSize: '16px', fill: '#00ff88', fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.load.on('progress', v => {
            bar.clear();
            bar.fillStyle(0x00ff88, 1);
            bar.fillRect(200, 280, 400 * v, 20);
        });

        // Tiles / plataformas
        this.load.image('platform', 'imagenes/ground_stone.png');
        this.load.image('ground_dirt', 'imagenes/ground_dirt.png');
        this.load.image('ground_diamond', 'imagenes/ground_diamond.png');
        this.load.image('ground_gold', 'imagenes/ground_gold.png');
        this.load.image('ground_lava', 'imagenes/ground_lava.png');
        this.load.image('ground_water', 'imagenes/ground_water.png');

        // Entidades
        this.load.image('server', 'imagenes/servidor.png');
        this.load.image('antenna', 'imagenes/antena.png');
        this.load.image('radar', 'imagenes/radar.png');
        this.load.image('tower', 'imagenes/torre.png');
        this.load.image('cable_utp', 'imagenes/cable_utp.png');
        this.load.image('cable_fiber', 'imagenes/cable-fibra.png');

        // Fondos
        this.load.image('background', 'imagenes/background.png');
        this.load.image('fondo', 'imagenes/fondo.png');
        this.load.image('gameover_img', 'imagenes/gameover.png');

        // Player spritesheet
        this.load.spritesheet('player', 'imagenes/player.png', {
            frameWidth: 250, frameHeight: 720
        });
    }

    create() {
        this.scene.start('menu');
    }
}
