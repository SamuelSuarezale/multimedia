export class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'gameover' });
    }

    preload() {
        this.load.image('gameover', 'imagenes/gameOver.png');
    }

    create(data) {
        // Mostrar fondo de Game Over
        this.add.image(400, 300, 'gameover').setDisplaySize(800, 600);

        // Mostrar nombre del jugador que murió (opcional)
        if (data.playerName) {
            this.add.text(400, 200, `${data.playerName} ha muerto`, {
                fontSize: '32px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Botón REINICIAR
        this.restartButton = this.add.text(400, 400, 'REINICIAR', {
            fontSize: '36px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        this.restartButton.on('pointerover', () => this.restartButton.setStyle({ fill: '#ffff00' }));
        this.restartButton.on('pointerout', () => this.restartButton.setStyle({ fill: '#00ff00' }));
        this.restartButton.on('pointerdown', () => {
            this.scene.start('game', { playerName: data.playerName });
        });
    }
}
