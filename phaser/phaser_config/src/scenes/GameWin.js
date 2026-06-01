export class GameWin extends Phaser.Scene {
    constructor() {
        super({ key: 'game-win' });
    }

    create() {
        // Fondo oscuro
        this.add.rectangle(400, 300, 800, 600, 0x000000).setAlpha(0.8);

        // Mensaje de Victoria
        const title = this.add.text(400, 200, '¡CONEXIÓN RESTABLECIDA!', {
            fontSize: '48px',
            fill: '#00ff00',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        const subtitle = this.add.text(400, 280, 'Has logrado conectar la infraestructura.', {
            fontSize: '24px', fill: '#ffffff'
        }).setOrigin(0.5);

        // Botón Siguiente Nivel
        const nextBtn = this.add.text(400, 400, 'SIGUIENTE NIVEL', {
            fontSize: '32px',
            fill: '#000000',
            backgroundColor: '#00ff00',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        nextBtn.on('pointerover', () => nextBtn.setStyle({ backgroundColor: '#ffffff' }));
        nextBtn.on('pointerout', () => nextBtn.setStyle({ backgroundColor: '#00ff00' }));
        nextBtn.on('pointerdown', () => {
            // Por ahora, reinicia el juego (simulando siguiente nivel o loop)
            // Podríamos pasar un parámetro level: 2
            this.scene.start('game', { playerName: 'Ingeniero PRO' });
        });

        // Botón Menu
        const menuBtn = this.add.text(400, 500, 'Volver al Menú', {
            fontSize: '20px', fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        menuBtn.on('pointerdown', () => this.scene.start('menu'));
    }
}
