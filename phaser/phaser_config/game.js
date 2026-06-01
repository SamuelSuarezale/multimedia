export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
    }

    init(data) {
        this.playerName = data.playerName || 'Jugador';
        this.score = 0;
    }

    preload() {
        // Carga de imágenes
        this.load.image('background', 'imagenes/background.png');
        this.load.image('platform', 'imagenes/ground_stone.png');
        this.load.image('ground_dirt', 'imagenes/ground_dirt.png');
        this.load.image('ground_diamond', 'imagenes/ground_diamond.png');
        this.load.image('ground_gold', 'imagenes/ground_gold.png');

        this.load.image('ground_lava', 'imagenes/ground_lava.png');
        this.load.image('ground_water', 'imagenes/ground_water.png');

        this.load.image('server', 'imagenes/servidor .png');
        this.load.image('antenna', 'imagenes/antena.png');
        this.load.image('radar', 'imagenes/radar.png');
        this.load.image('tower', 'imagenes/torre.png');
        this.load.image('cable_utp', 'imagenes/cable_utp.png');
        this.load.image('cable_fiber', 'imagenes/cable-fibra.png');

        // Carga de música
        this.load.audio('bgm', 'sonidos/musica.mp3');

        // Sprite del jugador (como imagen única si no hay spritesheet válido)
        this.load.spritesheet('player', 'imagenes/player.png', { frameWidth: 250, frameHeight: 720 });
    }

    create() {
        // --- CONFIGURACIÓN DE MUNDO ---
        this.physics.world.setBounds(0, 0, 3200, 600);
        this.cameras.main.setBounds(0, 0, 3200, 600);

        // Fondo
        this.add.image(400, 300, 'background')
            .setDisplaySize(800, 600)
            .setScrollFactor(0);

        // --- PLATAFORMAS Y OBSTÁCULOS ---
        this.platforms = this.physics.add.staticGroup();
        this.lavaGroup = this.physics.add.staticGroup();
        this.waterGroup = this.physics.add.staticGroup();

        // Suelo
        this.createGround(0, 1000);
        this.lavaGroup.create(1150, 580, 'ground_lava').setDisplaySize(300, 40).refreshBody();
        this.createGround(1300, 2000);
        this.waterGroup.create(2100, 580, 'ground_water').setDisplaySize(200, 40).refreshBody();
        this.createGround(2200, 3200);

        // Plataformas elevadas
        this.platforms.create(600, 450, 'ground_dirt').setDisplaySize(200, 40).refreshBody();
        this.platforms.create(900, 350, 'ground_diamond').setDisplaySize(150, 40).refreshBody();
        this.platforms.create(1100, 400, 'ground_gold').setDisplaySize(100, 40).refreshBody();
        this.platforms.create(1400, 300, 'platform').setDisplaySize(200, 40).refreshBody();
        this.waterGroup.create(1700, 250, 'ground_water').setDisplaySize(150, 40).refreshBody();
        this.platforms.create(2100, 350, 'ground_diamond').setDisplaySize(150, 40).refreshBody();
        this.lavaGroup.create(2400, 200, 'ground_lava').setDisplaySize(150, 40).refreshBody();
        this.platforms.create(2700, 350, 'platform').setDisplaySize(200, 40).refreshBody();

        // --- JUGADOR ---
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setScale(0.15);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(800);

        this.isCrouching = false;

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Colisiones Jugador
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.lavaGroup, this.hitLava, null, this);
        this.physics.add.collider(this.player, this.waterGroup, this.hitWater, null, this);

        // --- MÚSICA ---
        if (!this.sound.get('bgm')) {
            try { this.sound.play('bgm', { loop: true, volume: 0.5 }); } catch (e) { }
        }

        // --- HUB (UI) ---
        this.nameText = this.add.text(this.player.x, this.player.y - 50, this.playerName, {
            fontSize: '16px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.lives = 3;
        this.livesText = this.add.text(20, 20, 'Vidas: ' + this.lives, {
            fontSize: '24px', fill: '#ff0000', stroke: '#000000', strokeThickness: 3
        }).setScrollFactor(0);

        this.scoreText = this.add.text(20, 50, 'Cables: 0', {
            fontSize: '24px', fill: '#ffff00', stroke: '#000000', strokeThickness: 3
        }).setScrollFactor(0);

        // --- ITEMS (Cables) ---
        this.cables = this.physics.add.staticGroup();
        this.createCable(600, 400, 'cable_utp');
        this.createCable(1400, 250, 'cable_fiber');
        this.createCable(2400, 150, 'cable_fiber');
        this.createCable(2700, 300, 'cable_utp');

        this.physics.add.overlap(this.player, this.cables, this.collectCable, null, this);

        // --- TORRE (META) ---
        this.tower = this.physics.add.staticSprite(3050, 520, 'tower'); // Posición original
        this.tower.setScale(0.4);
        this.tower.refreshBody();
        this.physics.add.collider(this.tower, this.platforms);

        // --- ENEMIGOS ---
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();

        this.createEnemy(800, 400, 'server');
        this.createEnemy(1500, 200, 'radar');
        this.createEnemy(2000, 450, 'antenna');
        this.createEnemy(2500, 250, 'radar');
        this.createEnemy(2800, 500, 'server');

        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.collider(this.player, this.projectiles, this.hitByProjectile, null, this);
        this.physics.add.collider(this.projectiles, this.platforms, (proj) => proj.destroy());
        this.physics.add.collider(this.projectiles, this.lavaGroup, (proj) => proj.destroy());

        // --- CONTROLES ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ space: Phaser.Input.Keyboard.KeyCodes.SPACE });

        this.damageCooldown = false;
        this.healCooldown = false;
    }

    createGround(startX, endX) {
        for (let x = startX; x < endX; x += 100) {
            this.platforms.create(x + 50, 580, 'platform').setDisplaySize(100, 40).refreshBody();
        }
    }

    createCable(x, y, key) {
        // Tamaño ESTÁNDAR (0.1) - Como al principio
        this.cables.create(x, y, key).setScale(0.1).refreshBody();
    }

    createEnemy(x, y, type) {
        const enemy = this.enemies.create(x, y, type);
        enemy.setScale(0.08); // Tamaño estándar enemigos
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1);
        enemy.enemyType = type;
        enemy.lastFired = 0;

        if (type !== 'radar') {
            enemy.setVelocityX(Phaser.Math.Between(-50, 50));
        } else {
            enemy.body.allowGravity = false;
        }

        // Animaciones simples (Tweens)
        if (type === 'server') {
            this.tweens.add({ targets: enemy, scale: 0.1, duration: 500, yoyo: true, repeat: -1 });
        } else if (type === 'radar') {
            this.tweens.add({ targets: enemy, y: y + 150, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        } else if (type === 'antenna') {
            this.tweens.add({ targets: enemy, alpha: 0.5, duration: 200, yoyo: true, repeat: -1 });
        }
    }

    update(time, delta) {
        let speed = 200;

        // --- AGACHARSE ---
        if (this.cursors.down.isDown) {
            if (!this.isCrouching) {
                this.player.setScale(0.15, 0.075);
                this.player.body.updateFromGameObject();
                this.isCrouching = true;
            }
            speed = 100;
        } else {
            if (this.isCrouching) {
                this.player.y -= 25;
                this.player.setScale(0.15);
                this.player.body.updateFromGameObject();
                this.isCrouching = false;
            }
        }

        // --- MOVIMIENTO ---
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-700);
        }

        this.nameText.setPosition(this.player.x, this.player.y - 50);

        if (this.player.y > 600) this.gameOver();

        // --- IA ENEMIGOS ---
        this.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            if (dist < 600 && time > enemy.lastFired + 2000) {
                this.fireProjectile(enemy);
                enemy.lastFired = time;
            }
        });

        // --- VICTORY CHECK ---
        if (this.physics.overlap(this.player, this.tower)) {
            this.showWinPrompt();
            if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
                this.winGame();
            }
        } else {
            if (this.winText) this.winText.setVisible(false);
        }
    }

    fireProjectile(enemy) {
        let proj = this.projectiles.create(enemy.x, enemy.y, 'cable_utp');
        // PROYECTILES ESTÁNDAR (0.03 y vel 300) - Como al principio
        proj.setScale(0.03);
        proj.setTint(0xff0000);
        this.physics.moveToObject(proj, this.player, 300);

        this.tweens.add({
            targets: proj,
            angle: 360,
            duration: 300,
            repeat: -1
        });
    }

    hitByProjectile(player, projectile) {
        projectile.destroy();
        this.takeDamage(player);
    }

    hitEnemy(player, enemy) {
        this.takeDamage(player);
    }

    hitLava(player, lava) {
        this.takeDamage(player);
    }

    hitWater(player, water) {
        if (!this.healCooldown && this.lives < 3) {
            this.lives += 1;
            this.livesText.setText('Vidas: ' + this.lives);
            this.tweens.add({
                targets: player, tint: 0x0000ff, duration: 200, yoyo: true, repeat: 1,
                onComplete: () => player.clearTint()
            });
            this.healCooldown = true;
            this.time.delayedCall(2000, () => { this.healCooldown = false; });
        }
    }

    takeDamage(player) {
        if (!this.damageCooldown) {
            this.lives -= 1;
            this.livesText.setText('Vidas: ' + this.lives);
            this.tweens.add({
                targets: player, alpha: 0, duration: 100, yoyo: true, repeat: 5
            });
            this.damageCooldown = true;
            this.time.delayedCall(1000, () => { this.damageCooldown = false; });
            if (this.lives <= 0) this.gameOver();
        }
    }

    collectCable(player, cable) {
        cable.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Cables: ' + this.score);
    }

    showWinPrompt() {
        if (!this.winText) {
            this.winText = this.add.text(400, 100, 'Presiona ESPACIO para Configurar', {
                fontSize: '20px', fill: '#ffffff', backgroundColor: '#000000'
            }).setOrigin(0.5).setScrollFactor(0);
        }
        this.winText.setVisible(true);
    }

    winGame() {
        this.physics.pause();
        this.add.text(400, 300, 'Configuración Exitosa', {
            fontSize: '48px', fill: '#00ff00', backgroundColor: '#000000', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0);
        this.time.delayedCall(3000, () => { this.scene.start('menu'); });
    }

    gameOver() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.scene.start('gameover', { playerName: this.playerName });
    }
}
