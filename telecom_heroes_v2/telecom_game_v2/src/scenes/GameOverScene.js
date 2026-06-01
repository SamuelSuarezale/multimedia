export class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'gameover' }); }

    create(data) {
        const { playerName = 'Ingeniero', score = 0, level = 1 } = data;

        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Fondo de gameover
        try {
            this.add.image(400, 300, 'gameover_img').setDisplaySize(800, 600).setAlpha(0.7);
        } catch (e) {
            this.add.rectangle(400, 300, 800, 600, 0x1a0000);
        }

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);

        // Texto principal
        const goText = this.add.text(400, 160, 'GAME OVER', {
            fontSize: '64px', fill: '#ff2200', fontFamily: 'monospace',
            fontStyle: 'bold', stroke: '#550000', strokeThickness: 8
        }).setOrigin(0.5);
        this.tweens.add({ targets: goText, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });

        this.add.text(400, 230, playerName + ' ha caído en el Sector ' + level, {
            fontSize: '20px', fill: '#ffaaaa', fontFamily: 'monospace'
        }).setOrigin(0.5);

        // Score
        this.add.rectangle(400, 300, 340, 70, 0x200000, 0.9).setStrokeStyle(1, 0xff4400);
        this.add.text(400, 285, 'Puntaje alcanzado', {
            fontSize: '14px', fill: '#aa6655', fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.add.text(400, 310, score.toLocaleString() + ' pts', {
            fontSize: '26px', fill: '#ffaa00', fontFamily: 'monospace', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Botones
        const retryBtn = this.add.text(280, 420, '↺ REINTENTAR', {
            fontSize: '22px', fill: '#000000', backgroundColor: '#ff4422',
            padding: { x: 16, y: 10 }, fontFamily: 'monospace'
        }).setOrigin(0.5).setInteractive();

        retryBtn.on('pointerover', () => retryBtn.setStyle({ backgroundColor: '#ff6644' }));
        retryBtn.on('pointerout', () => retryBtn.setStyle({ backgroundColor: '#ff4422' }));
        retryBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('game', { playerName, level: 1, score: 0, lives: 3 });
            });
        });

        const menuBtn = this.add.text(540, 420, '⌂ MENÚ', {
            fontSize: '18px', fill: '#ff4422', backgroundColor: '#200000',
            padding: { x: 16, y: 10 }, fontFamily: 'monospace',
            stroke: '#ff4422', strokeThickness: 1
        }).setOrigin(0.5).setInteractive();

        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#ffffff' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#ff4422' }));
        menuBtn.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('menu');
        });

        this.add.text(400, 560, 'La red necesita de tu ingenio. ¡Vuelve a intentarlo!', {
            fontSize: '13px', fill: '#665544', fontFamily: 'monospace'
        }).setOrigin(0.5);
    }
}
