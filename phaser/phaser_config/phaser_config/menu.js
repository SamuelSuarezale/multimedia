export class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'menu' });
    }

    preload() {
        this.load.image('menu', 'imagenes/fondo.png'); // fondo del menú
    }

    create() {
        // Fondo
        this.add.image(400, 300, 'menu').setDisplaySize(800, 600);

        // Título animado
        this.title = this.add.text(400, 100, 'Ingeniería Telecom Game', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.title,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Partículas animadas sobre el fondo
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            let p = this.add.circle(
                Phaser.Math.Between(0, 800),
                Phaser.Math.Between(0, 600),
                Phaser.Math.Between(3, 8),
                Phaser.Display.Color.RandomRGB().color,
                0.5
            );
            p.speedX = Phaser.Math.Between(-50, 50);
            p.speedY = Phaser.Math.Between(-30, 30);
            this.particles.push(p);
        }

        // Input HTML para nombre
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.placeholder = 'Ingresa tu nombre';
        this.nameInput.style.position = 'absolute';
        this.nameInput.style.left = '300px';
        this.nameInput.style.top = '520px';
        this.nameInput.style.width = '200px';
        this.nameInput.style.fontSize = '20px';
        document.body.appendChild(this.nameInput);

        // Botón JUGAR
        this.playButton = this.add.text(400, 300, 'JUGAR', {
            fontSize: '36px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        this.playButton.on('pointerover', () => this.playButton.setStyle({ fill: '#ffff00' }));
        this.playButton.on('pointerout', () => this.playButton.setStyle({ fill: '#00ff00' }));
        this.playButton.on('pointerdown', () => {
            const playerName = this.nameInput.value || 'Jugador';
            console.log('Nombre del jugador:', playerName);

            // Ocultar input
            this.nameInput.style.display = 'none';

            this.tweens.add({
                targets: this.playButton,
                scale: 0.8,
                duration: 100,
                yoyo: true,
                onComplete: () => this.scene.start('game', { playerName })
            });
        });

        // Botón INSTRUCCIONES
        this.instructionsButton = this.add.text(400, 400, 'INSTRUCCIONES', {
            fontSize: '28px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();

        this.instructionsButton.on('pointerover', () => this.instructionsButton.setStyle({ fill: '#00ff00' }));
        this.instructionsButton.on('pointerout', () => this.instructionsButton.setStyle({ fill: '#ffff00' }));
        this.instructionsButton.on('pointerdown', () => {
            alert('Usa las flechas para moverte y saltar.\nEvita los ataques del servidor.\nRecoge materiales para pasar el nivel.');
        });
    }

    update(time, delta) {
        // Animar partículas
        this.particles.forEach(p => {
            p.x += p.speedX * delta / 1000;
            p.y += p.speedY * delta / 1000;
            if (p.x < 0 || p.x > 800) p.speedX *= -1;
            if (p.y < 0 || p.y > 600) p.speedY *= -1;
        });
    }
}
