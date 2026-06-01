import { Player } from '../entities/Player.js';
import { Inventory } from '../systems/Inventory.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
    }

    init(data) {
        this.playerName = data.playerName || 'Ingeniero';
    }

    preload() {
        // Assets
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

        this.load.audio('bgm', 'sonidos/musica.mp3');

        this.load.spritesheet('player', 'imagenes/player.png', {
            frameWidth: 250,
            frameHeight: 720
        });
    }

    create() {
        // --- SISTEMAS ---
        this.inventory = new Inventory(this);
        this.scene.launch('ui');

        // --- MUNDO (EXPANDIDO 6400px) ---
        const mapWidth = 6400;
        this.physics.world.setBounds(0, 0, mapWidth, 600);
        this.cameras.main.setBounds(0, 0, mapWidth, 600);

        this.add.image(mapWidth / 2, 300, 'background')
            .setDisplaySize(mapWidth, 600)
            .setScrollFactor(0);

        // --- GRUPOS ---
        this.platforms = this.physics.add.staticGroup();
        this.lavaGroup = this.physics.add.staticGroup();
        this.waterGroup = this.physics.add.staticGroup();
        this.devices = this.physics.add.staticGroup();

        this.buildLevel(mapWidth);

        // --- JUGADOR ---
        this.player = new Player(this, 100, 450);
        this.cameras.main.startFollow(this.player.sprite, true, 0.05, 0.05);

        // --- ENTIDADES ---
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.spawnEnemies(mapWidth);

        this.cables = this.physics.add.staticGroup();
        this.spawnCables(mapWidth);

        // META LEJANA
        this.tower = this.physics.add.staticSprite(mapWidth - 150, 520, 'tower').setScale(0.4).refreshBody();

        // --- COLISIONES ---
        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.collider(this.player.sprite, this.devices);
        this.physics.add.collider(this.player.sprite, this.lavaGroup, () => this.player.takeDamage());
        this.physics.add.collider(this.player.sprite, this.waterGroup, () => this.player.heal());

        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.devices);

        this.physics.add.overlap(this.player.sprite, this.cables, (p, c) => this.collectCable(c));
        this.physics.add.overlap(this.player.sprite, this.tower, () => this.checkWin());

        // --- INPUTS ---
        this.input.on('pointerdown', (pointer) => {
            let worldPoint = pointer.positionToCamera(this.cameras.main);
            let checkX = Math.floor(worldPoint.x / 50) * 50 + 25;
            let checkY = Math.floor(worldPoint.y / 50) * 50 + 25;
            if (pointer.leftButtonDown()) this.placeBlock(checkX, checkY);
        });

        this.input.mouse.disableContextMenu();
        this.input.keyboard.on('keydown-ONE', () => this.inventory.selectItem(0));
        this.input.keyboard.on('keydown-TWO', () => this.inventory.selectItem(1));
        this.input.keyboard.on('keydown-THREE', () => this.inventory.selectItem(2));
        this.input.keyboard.on('keydown-FOUR', () => this.inventory.selectItem(3));

        // Inicializar UI
        this.events.emit('inventory-updated', this.inventory.items);
        this.events.emit('update-lives', this.player.lives);

        if (!this.sound.get('bgm')) {
            try { this.sound.play('bgm', { loop: true, volume: 0.5 }); } catch (e) { }
        }
    }

    update(time, delta) {
        this.player.update();
        this.events.emit('update-lives', this.player.lives);

        if (this.player.sprite.y > 600 || this.player.lives <= 0) {
            this.scene.stop('ui'); // Parar UI
            this.scene.start('gameover', { playerName: this.playerName });
        }

        this.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.sprite.x, this.player.sprite.y);
            if (dist < 800 && time > enemy.lastFired + 2000) {
                this.fireProjectile(enemy);
                enemy.lastFired = time;
            }
        });
    }

    placeBlock(x, y) {
        const item = this.inventory.getSelected();
        const dist = Phaser.Math.Distance.Between(x, y, this.player.sprite.x, this.player.sprite.y);
        if (dist > 300) return;

        if (this.inventory.useItem(item)) {
            if (item.includes('ground') || item === 'platform') {
                this.platforms.create(x, y, item).setDisplaySize(50, 50).refreshBody();
            } else if (item.includes('cable')) {
                this.add.image(x, y, item).setDisplaySize(40, 10);
            } else if (item === 'router') {
                this.devices.create(x, y, 'server').setDisplaySize(40, 40).refreshBody();
            }
        }
    }

    collectCable(cable) {
        let type = cable.texture.key;
        this.inventory.addItem(type, 1);
        cable.destroy();
    }

    checkWin() {
        if (!this.winText) {
            this.winText = this.add.text(400, 100, 'Presiona ESPACIO para Configurar', {
                fontSize: '20px', fill: '#ffffff', backgroundColor: '#000000'
            }).setOrigin(0.5).setScrollFactor(0);
        }
        this.winText.setVisible(true);
        // Ir a escena GameWin
        if (this.input.keyboard.checkDown(this.keys.space, 500)) {
            this.scene.stop('ui');
            this.scene.start('game-win');
        }
    }

    buildLevel(width) {
        // Procedural
        let currentX = 0;
        while (currentX < width) {
            if (currentX > 500 && Math.random() < 0.1) {
                currentX += 150; // Hueco
            }
            this.platforms.create(currentX + 25, 575, 'platform').setDisplaySize(50, 50).refreshBody();
            currentX += 50;
        }

        // Plataformas
        for (let i = 0; i < 40; i++) {
            let x = Phaser.Math.Between(400, width - 400);
            let y = Phaser.Math.Between(200, 450);
            this.platforms.create(x, y, 'ground_dirt').setDisplaySize(200, 40).refreshBody();
        }

        // Items Especiales
        this.waterGroup.create(2100, 580, 'ground_water').setDisplaySize(200, 40).refreshBody();
        this.waterGroup.create(4500, 580, 'ground_water').setDisplaySize(200, 40).refreshBody();
    }

    createGround() { }

    spawnEnemies(width) {
        for (let i = 0; i < 15; i++) {
            let x = Phaser.Math.Between(800, width - 800);
            let y = Phaser.Math.Between(100, 500);
            let type = ['server', 'radar', 'antenna'][Phaser.Math.Between(0, 2)];
            this.createEnemy(x, y, type);
        }
    }

    createEnemy(x, y, type) {
        const enemy = this.enemies.create(x, y, type);
        enemy.setScale(0.08);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1);
        enemy.enemyType = type;
        enemy.lastFired = 0;

        if (type !== 'radar') enemy.setVelocityX(Phaser.Math.Between(-50, 50));
        else enemy.body.allowGravity = false;

        if (type === 'server') this.tweens.add({ targets: enemy, scale: 0.1, duration: 500, yoyo: true, repeat: -1 });
        else if (type === 'radar') this.tweens.add({ targets: enemy, y: y + 150, duration: 3000, yoyo: true, repeat: -1 });
        else if (type === 'antenna') this.tweens.add({ targets: enemy, alpha: 0.5, duration: 200, yoyo: true, repeat: -1 });
    }

    spawnCables(width) {
        for (let i = 0; i < 20; i++) {
            let x = Phaser.Math.Between(500, width - 500);
            let y = Phaser.Math.Between(100, 500);
            let type = Math.random() > 0.5 ? 'cable_utp' : 'cable_fiber';
            this.createCable(x, y, type);
        }
    }

    createCable(x, y, key) {
        this.cables.create(x, y, key).setScale(0.05).refreshBody(); // SMALLER CABLES
    }

    fireProjectile(enemy) {
        let proj = this.projectiles.create(enemy.x, enemy.y, 'cable_utp');
        proj.setScale(0.03);
        proj.setTint(0xff0000);
        this.physics.moveToObject(proj, this.player.sprite, 300);
        this.tweens.add({ targets: proj, angle: 360, duration: 300, repeat: -1 });
    }

    hitByProjectile(proj) {
        proj.destroy();
        this.player.takeDamage();
    }

    hitEnemy() { this.player.takeDamage(); }
    hitLava() { this.player.takeDamage(); }
    hitWater() { this.player.heal(); }
}
