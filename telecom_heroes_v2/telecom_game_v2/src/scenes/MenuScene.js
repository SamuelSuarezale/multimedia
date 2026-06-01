export class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'menu' }); }

    create() {
        // Mostrar formulario HTML
        const form = document.getElementById('name-form');
        const input = document.getElementById('player-name');
        const btn = document.getElementById('start-btn');
        form.style.display = 'block';
        input.value = '';
        input.focus();

        // Fondo con parallax de partículas
        this.add.image(400, 300, 'fondo').setDisplaySize(800, 600).setAlpha(0.6);

        // Título con glow effect via tweens
        const title = this.add.text(400, 100, 'TELECOM HEROES', {
            fontSize: '52px', fill: '#00ff88', fontFamily: 'monospace',
            stroke: '#004422', strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({ targets: title, y: 108, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        const sub = this.add.text(400, 160, 'Misión: Restaurar la Red Nacional', {
            fontSize: '18px', fill: '#88ffcc', fontFamily: 'monospace'
        }).setOrigin(0.5).setAlpha(0.85);

        // Instrucciones
        const instrBox = this.add.rectangle(400, 320, 520, 180, 0x001122, 0.85)
            .setStrokeStyle(1, 0x00ff88);
        const instrText = [
            '← → : Mover        ↑ : Saltar',
            '↓   : Agacharse     Z : Atacar',
            '1-4 : Seleccionar ítem del inventario',
            'Click izquierdo : Colocar bloque/cable',
            '',
            'Recolecta cables · Evita servidores hostiles',
            'Llega a la torre para completar la misión'
        ].join('\n');

        this.add.text(400, 320, instrText, {
            fontSize: '14px', fill: '#aaffdd', fontFamily: 'monospace', align: 'center', lineSpacing: 6
        }).setOrigin(0.5);

        // Partículas flotantes
        for (let i = 0; i < 40; i++) {
            const p = this.add.circle(
                Phaser.Math.Between(0, 800),
                Phaser.Math.Between(0, 600),
                Phaser.Math.Between(2, 5),
                Phaser.Math.RND.pick([0x00ff88, 0x0088ff, 0xff8800]),
                0.4
            );
            this.tweens.add({
                targets: p,
                x: p.x + Phaser.Math.Between(-60, 60),
                y: p.y + Phaser.Math.Between(-60, 60),
                alpha: 0.1,
                duration: Phaser.Math.Between(2000, 5000),
                yoyo: true, repeat: -1
            });
        }

        // Versión
        this.add.text(790, 590, 'v2.0', {
            fontSize: '11px', fill: '#446655', fontFamily: 'monospace'
        }).setOrigin(1, 1);

        // Iniciar juego
        const startGame = () => {
            const playerName = input.value.trim() || 'Ingeniero';
            form.style.display = 'none';
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.time.delayedCall(400, () => {
                this.scene.start('game', { playerName, level: 1, score: 0, lives: 3 });
            });
        };

        btn.onclick = startGame;
        input.onkeydown = (e) => { if (e.key === 'Enter') startGame(); };

        this.events.on('shutdown', () => { form.style.display = 'none'; });
    }
}
