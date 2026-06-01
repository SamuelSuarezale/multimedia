export class GameWinScene extends Phaser.Scene {
    constructor() { super({ key: 'game-win' }); }

    create(data) {
        const { playerName = 'Ingeniero', level = 1, score = 0, lives = 1, timeBonus = 0 } = data;
        const nextLevel = level + 1;
        const hasNext = nextLevel <= 3;

        // Fondo
        this.add.rectangle(400, 300, 800, 600, 0x000a18).setAlpha(1);

        // Partículas de victoria
        for (let i = 0; i < 60; i++) {
            const p = this.add.circle(
                Phaser.Math.Between(0, 800), Phaser.Math.Between(-50, 200),
                Phaser.Math.Between(3, 8),
                Phaser.Math.RND.pick([0x00ff88, 0x00aaff, 0xffff00, 0xff88aa])
            );
            this.tweens.add({
                targets: p, y: p.y + 700, alpha: 0,
                duration: Phaser.Math.Between(2000, 5000),
                delay: Phaser.Math.Between(0, 1500),
                repeat: -1
            });
        }

        // Título
        const title = this.add.text(400, 110, '¡MISIÓN COMPLETADA!', {
            fontSize: '42px', fill: '#00ff88', fontFamily: 'monospace',
            fontStyle: 'bold', stroke: '#004422', strokeThickness: 5
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: title, alpha: 1, y: 120, duration: 600 });
        this.tweens.add({ targets: title, scale: 1.04, duration: 800, yoyo: true, repeat: -1, delay: 600 });

        // Nombre jugador
        this.add.text(400, 175, playerName + ' · Nivel ' + level, {
            fontSize: '20px', fill: '#88ffcc', fontFamily: 'monospace'
        }).setOrigin(0.5).setAlpha(0.9);

        // Stats card
        const cardBg = this.add.rectangle(400, 290, 460, 160, 0x001a0e, 1)
            .setStrokeStyle(1, 0x00ff88);

        const stats = [
            ['Puntaje', score.toLocaleString() + ' pts', '#ffff00'],
            ['Bonus tiempo', '+' + timeBonus.toLocaleString(), '#ffaa00'],
            ['Vidas restantes', '♥ '.repeat(Math.max(0, lives)), '#ff4466'],
        ];

        stats.forEach(([label, val, color], i) => {
            this.add.text(200, 232 + i * 44, label, {
                fontSize: '16px', fill: '#88aaaa', fontFamily: 'monospace'
            });
            this.add.text(600, 232 + i * 44, val, {
                fontSize: '16px', fill: color, fontFamily: 'monospace', fontStyle: 'bold'
            }).setOrigin(1, 0);
        });

        // Total
        this.add.line(400, 378, -220, 0, 220, 0, 0x00ff88, 0.5);
        this.add.text(200, 384, 'TOTAL', { fontSize: '18px', fill: '#00ff88', fontFamily: 'monospace' });
        const total = score + timeBonus;
        this.add.text(600, 384, total.toLocaleString() + ' pts', {
            fontSize: '22px', fill: '#00ff88', fontFamily: 'monospace', fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Mensaje si es el último nivel
        if (!hasNext) {
            this.add.text(400, 430, '¡HAS RESTAURADO TODA LA RED NACIONAL!', {
                fontSize: '16px', fill: '#ffff00', fontFamily: 'monospace'
            }).setOrigin(0.5);
        }

        // Botones
        const btnY = hasNext ? 490 : 490;

        if (hasNext) {
            const nextBtn = this.add.text(280, btnY, '▶ SIGUIENTE NIVEL', {
                fontSize: '22px', fill: '#000000', backgroundColor: '#00ff88',
                padding: { x: 18, y: 10 }, fontFamily: 'monospace'
            }).setOrigin(0.5).setInteractive();
            nextBtn.on('pointerover', () => nextBtn.setStyle({ fill: '#000000', backgroundColor: '#66ffaa' }));
            nextBtn.on('pointerout', () => nextBtn.setStyle({ fill: '#000000', backgroundColor: '#00ff88' }));
            nextBtn.on('pointerdown', () => {
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.time.delayedCall(300, () => {
                    this.scene.start('game', {
                        playerName, level: nextLevel, score: total,
                        lives: Math.min(lives, 3)
                    });
                });
            });
        }

        const menuBtn = this.add.text(hasNext ? 560 : 400, btnY, '⌂ MENÚ', {
            fontSize: '18px', fill: '#00ff88', backgroundColor: '#001a0e',
            padding: { x: 18, y: 10 }, fontFamily: 'monospace',
            stroke: '#00ff88', strokeThickness: 1
        }).setOrigin(0.5).setInteractive();
        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#ffffff' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#00ff88' }));
        menuBtn.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('menu');
        });

        // Fadeout
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }
}
