import { createAnimations } from './animations.js';

// NOTA: Usamos 'this.' para todas las referencias de objetos,
// siguiendo las mejores prácticas de Phaser, como en el juego funcional.

const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 700,
    parent: 'game-container',
    
    // AÑADIDO: Escala y centrado responsivo (opcional, pero recomendado)
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH, 
    },
    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

new Phaser.Game(config); // Usamos new Phaser.Game(config) directamente

// Variables Globales necesarias para el HUD
var score = 0;
var lives = 3;
var timeLeft = 120;
var gameOver = false;

// --- FASES DE LA ESCENA ---

function preload() {
    this.load.image('sky', 'assets/sky.jpg');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    
    // CORRECCIÓN: Carga como SPRITESHEET bajo la clave 'mario'
    this.load.spritesheet('mario', 'assets/player.png', {
        frameWidth: 32, 
        frameHeight: 32 
    });
}

function create() {
    // 1. REINICIO DE VARIABLES GLOBALES
    score = 0;
    lives = 3;
    timeLeft = 120;
    gameOver = false;
    
    // 2. CREACIÓN DEL MUNDO Y OBJETOS

    // Fondo y límites
    this.add.image(800, 350, 'sky').setScrollFactor(0).displayWidth = 1600;
    this.physics.world.setBounds(0, 0, 1600, config.height); // Usamos config.height para el mundo vertical

    // Plataformas (ahora usando this.platforms)
    this.platforms = this.physics.add.staticGroup();

    // AJUSTE: Reducimos la escala de la plataforma principal para que no sea tan grande
    let main_platform = this.platforms.create(400, 568, 'ground').setScale(1).refreshBody();
    this.platforms.create(600, 400, 'ground').setScale(0.5).refreshBody(); 
    this.platforms.create(50, 250, 'ground').setScale(0.5).refreshBody(); 
    this.platforms.create(750, 220, 'ground').setScale(0.5).refreshBody(); 

    // JUGADOR (ahora usando this.player)
    this.player = this.physics.add.sprite(100, 450, 'mario')
        .setScale(1.5) // AJUSTE: Aumentamos la escala para que Mario se vea mucho más grande
        .setBounce(0.2)
        .setCollideWorldBounds(true)
        .setOrigin(0.5, 1); // CORRECCIÓN: Origen en el pie para alineación correcta

    this.physics.add.collider(this.player, this.platforms);

    // Creación de animaciones
    createAnimations(this); 

    // 3. CONTROLES Y CÁMARA
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.cameras.main.setBounds(0, 0, 1600, config.height);
    this.cameras.main.startFollow(this.player);

    // 4. ESTRELLAS, BOMBAS Y COLISIONES (ahora usando this.stars y this.bombs)
    this.stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate(function (child) {
        child.setScale(0.5); 
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, collectStar, null, this);

    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, hitBomb, null, this);

    // 5. TEXTO DE LA INTERFAZ (HUD)
    // AJUSTE: Se añade un fondo negro semi-transparente (backgroundColor: '#000000cc') para asegurar la lectura
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF', backgroundColor: '#000000cc' }).setScrollFactor(0);
    this.livesText = this.add.text(1400, 16, 'Lives: 3', { fontSize: '32px', fill: '#FFF', backgroundColor: '#000000cc' }).setScrollFactor(0);
    this.timeText = this.add.text(750, 16, 'Time: 120', { fontSize: '32px', fill: '#FFF', backgroundColor: '#000000cc' }).setScrollFactor(0);

    // 6. EVENTO DE TIEMPO
    this.timerEvent = this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, loop: true });
}

function update() {
    // Si gameOver es true o el jugador está muerto, se reproduce la animación de muerte y sale
    if (gameOver || this.player.isDead) {
        this.player.anims.play('mario-dead', true);
        return;
    }

    // Lógica de Movimiento y Animación
    const keys = this.cursors;
    const wasdKeys = this.wasd;
    const player = this.player;

    if (keys.left.isDown || wasdKeys.left.isDown) {
        player.setVelocityX(-160);
        player.flipX = true;
        player.anims.play('mario-walk', true); 
    } else if (keys.right.isDown || wasdKeys.right.isDown) {
        player.setVelocityX(160);
        player.flipX = false;
        player.anims.play('mario-walk', true); 
    } else {
        player.setVelocityX(0);
        player.anims.play('mario-idle', true); 
    }

    // Lógica de Salto
    if ((keys.up.isDown || wasdKeys.up.isDown) && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Lógica de Salto/Caída: Sobreescribir con la animación de salto
    if (!player.body.touching.down) {
        player.anims.play('mario-jump', true);
    }
    
    // CORRECCIÓN CLAVE: Lógica de Muerte por Caída (como en el JF)
    if (player.y > config.height) {
        endGame(this, 'FELL TO DEATH');
    }
}

// --- FUNCIONES DE LÓGICA DEL JUEGO ---

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    this.scoreText.setText('Score: ' + score); // Usamos this.scoreText

    if (this.stars.countActive(true) === 0) { // Usamos this.stars
        this.stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (this.player.x < 800) ? Phaser.Math.Between(800, 1600) : Phaser.Math.Between(0, 800);

        var bomb = this.bombs.create(x, 16, 'bomb'); // Usamos this.bombs
        bomb.setScale(0.5); 
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.body.onWorldBounds = true;

        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitBomb(player, bomb) {
    if (bomb) {
        bomb.disableBody(true, true);
    }

    lives -= 1;
    this.livesText.setText('Lives: ' + lives); // Usamos this.livesText

    if (lives === 0) {
        endGame(this, 'GAME OVER');
    } else {
        // Lógica de daño
        player.setTint(0xff0000);
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.setImmovable(true);

        this.time.delayedCall(1000, () => {
            player.clearTint();
            player.setImmovable(false);
            player.setPosition(100, 450);
        });
    }
}

function updateTimer() {
    if (gameOver) {
        this.timerEvent.destroy();
        return;
    }

    timeLeft -= 1;
    this.timeText.setText('Time: ' + timeLeft); // Usamos this.timeText

    if (timeLeft <= 0) {
        endGame(this, 'TIME IS UP');
    }
}

function endGame(scene, message) {
    gameOver = true;
    scene.physics.pause();
    scene.player.setTint(0xff0000); // Usamos scene.player

    if (scene.timerEvent) {
        scene.timerEvent.destroy();
    }

    let gameOverText = scene.add.text(800, 350, message, {
        fontSize: '64px',
        fill: '#FFF',
        backgroundColor: '#00000080'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    
    // Opcional: Reiniciar la escena después de un retraso, como en el juego funcional
    scene.time.delayedCall(3000, () => {
        scene.scene.restart();
    });
}