import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Inventory } from '../systems/Inventory.js';
import { LevelBuilder } from '../systems/LevelBuilder.js';

export class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'game' }); }

    init(data) {
        this.playerName = data.playerName || 'Ingeniero';
        this.currentLevel = data.level || 1;
        this.totalScore = data.score || 0;
        this.startLives = data.lives || 3;
    }

    create() {
        // Construir nivel
        this.builder = new LevelBuilder(this);
        this.platforms = this.physics.add.staticGroup();
        this.lavaGroup = this.physics.add.staticGroup();
        this.waterGroup = this.physics.add.staticGroup();

        this.levelConfig = this.builder.build(
            this.currentLevel, this.platforms, this.lavaGroup, this.waterGroup
        );

        const mapW = this.levelConfig.mapWidth;

        // Mundo
        this.physics.world.setBounds(0, 0, mapW, 600);
        this.cameras.main.setBounds(0, 0, mapW, 600);

        // Fondo con parallax
        this.bg = this.add.image(mapW / 2, 300, 'background')
            .setDisplaySize(mapW, 600)
            .setScrollFactor(0.2)
            .setTint(this.levelConfig.bgTint);

        // Fog of war – oscurecer extremos
        const fogLeft = this.add.rectangle(0, 300, 200, 600, 0x000000, 0.5).setScrollFactor(0);
        const fogRight = this.add.rectangle(800, 300, 200, 600, 0x000000, 0.5).setScrollFactor(0);

        // Inventario
        this.inventory = new Inventory(this);

        // Jugador
        this.player = new Player(this, 120, 450);
        this.player.lives = this.startLives;
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        // Enemigos
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.enemyObjects = [];
        this._spawnEnemies(mapW);

        // Cables recolectables
        this.cables = this.physics.add.staticGroup();
        this._spawnCables(mapW);

        // Power-ups (corazones extra)
        this.powerups = this.physics.add.staticGroup();
        this._spawnPowerups(mapW);

        // META – torre al final
        this.tower = this.physics.add.staticSprite(mapW - 180, 520, 'tower')
            .setScale(0.45).refreshBody();
        // Aura pulsante sobre la torre
        this.towerGlow = this.add.circle(mapW - 180, 500, 30, 0x00ff88, 0.25);
        this.tweens.add({ targets: this.towerGlow, radius: 50, alpha: 0, duration: 1200, repeat: -1 });

        // Colisiones
        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.collider(this.player.sprite, this.lavaGroup, () => this._touchLava());
        this.physics.add.collider(this.player.sprite, this.waterGroup, () => this.player.heal());
        this.physics.add.collider(this.enemies, this.platforms);

        this.physics.add.overlap(this.player.sprite, this.cables, (p, c) => this._collectCable(c));
        this.physics.add.overlap(this.player.sprite, this.powerups, (p, pu) => this._collectPowerup(pu));
        this.physics.add.overlap(this.player.sprite, this.enemies, () => this.player.takeDamage());
        this.physics.add.overlap(this.player.sprite, this.projectiles, (p, proj) => {
            proj.destroy();
            this.player.takeDamage();
        });
        this.physics.add.overlap(this.player.attackHitbox, this.enemies, (hitbox, enemySprite) => {
            if (!this.player.isAttacking) return;
            const ref = enemySprite.enemyRef;
            if (ref) ref.hit(1);
        });
        this.physics.add.collider(this.projectiles, this.platforms, (proj) => proj.destroy());
        this.physics.add.collider(this.projectiles, this.lavaGroup, (proj) => proj.destroy());

        // Colocar bloques con click
        this.input.on('pointerdown', (pointer) => {
            const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const dist = Phaser.Math.Distance.Between(wp.x, wp.y, this.player.sprite.x, this.player.sprite.y);
            if (dist < 250 && pointer.leftButtonDown()) this._placeBlock(wp.x, wp.y);
        });
        this.input.mouse.disableContextMenu();

        // Teclas inventario 1-4
        this.input.keyboard.on('keydown-ONE', () => { this.inventory.selectIndex(0); });
        this.input.keyboard.on('keydown-TWO', () => { this.inventory.selectIndex(1); });
        this.input.keyboard.on('keydown-THREE', () => { this.inventory.selectIndex(2); });
        this.input.keyboard.on('keydown-FOUR', () => { this.inventory.selectIndex(3); });

        // Escuchar muertes de enemigos
        this.events.on('enemy-killed', (pts) => {
            this.totalScore += pts;
            this.events.emit('score-update', this.totalScore);
        });

        // Lanzar UI
        this.scene.launch('ui');
        this.time.delayedCall(100, () => {
            this.events.emit('level-start', this.currentLevel, this.levelConfig.name);
            this.events.emit('inventory-updated', { ...this.inventory.items });
            this.events.emit('item-selected', this.inventory.getSelectedKey());
            this.events.emit('update-lives', this.player.lives);
            this.events.emit('score-update', this.totalScore);
        });

        // Timer de nivel
        this.levelTime = 0;

        // Música
        if (!this.sound.get('bgm')) {
            try { this.sound.play('bgm', { loop: true, volume: 0.4 }); } catch (e) {}
        }

        this._winTriggered = false;
        this._gameOverTriggered = false;
    }

    update(time, delta) {
        this.player.update(time);
        this.levelTime += delta;

        // Actualizar barras HP de enemigos
        this.enemyObjects.forEach(e => { if (e.sprite.active) e.updateHPBar(); });

        // Emitir vidas
        this.events.emit('update-lives', this.player.lives);

        // Muerte del jugador
        if ((this.player.lives <= 0 || this.player.sprite.y > 620) && !this._gameOverTriggered) {
            this._gameOverTriggered = true;
            this._triggerGameOver();
            return;
        }

        // IA enemigos – disparar
        this.enemies.getChildren().forEach(enemy => {
            const ref = enemy.enemyRef;
            if (!ref) return;
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.sprite.x, this.player.sprite.y);
            if (dist < 700 && time > ref.lastFired + ref.fireRate) {
                this._fireProjectile(enemy);
                ref.lastFired = time;
            }
        });

        // Check victoria
        if (!this._winTriggered) {
            const dist = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                this.tower.x, this.tower.y
            );
            if (dist < 80) {
                this._triggerWin();
            }
        }
    }

    _spawnEnemies(mapW) {
        const cfg = this.levelConfig;
        for (let i = 0; i < cfg.enemies; i++) {
            const x = Phaser.Math.Between(800, mapW - 800);
            const y = Phaser.Math.Between(80, 480);
            const type = Phaser.Math.RND.pick(cfg.enemyTypes);
            const enemy = new Enemy(this, x, y, type);
            this.enemyObjects.push(enemy);
        }

        // Boss en nivel 3
        if (cfg.hasBoss) {
            const boss = new Enemy(this, mapW - 600, 200, 'server');
            boss.hp = 8;
            boss.maxHp = 8;
            boss.fireRate = 800;
            boss.sprite.setScale(0.2);
            this.scene.tweens.add({ targets: boss.sprite, scale: 0.22, duration: 400, yoyo: true, repeat: -1 });
            this.enemyObjects.push(boss);
        }
    }

    _spawnCables(mapW) {
        const count = this.levelConfig.cables;
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(400, mapW - 400);
            const y = Phaser.Math.Between(100, 520);
            const key = Math.random() > 0.4 ? 'cable_utp' : 'cable_fiber';
            const c = this.cables.create(x, y, key).setScale(0.07).refreshBody();
            // Animación flotante
            this.tweens.add({ targets: c, y: y - 12, duration: 1000 + i * 80, yoyo: true, repeat: -1 });
        }
    }

    _spawnPowerups(mapW) {
        const count = this.levelConfig.extraLives + 1;
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(600, mapW - 600);
            const pu = this.powerups.create(x, 200, 'ground_water').setScale(0.06).refreshBody();
            pu.setTint(0xff6699);
            this.tweens.add({ targets: pu, y: 190, duration: 800, yoyo: true, repeat: -1 });
        }
    }

    _collectCable(cable) {
        const type = cable.texture.key;
        cable.destroy();
        this.inventory.addItem(type, 1);
        this.totalScore += 10;
        this.events.emit('score-update', this.totalScore);
        this.events.emit('cable-collected', type);

        // Popup
        const popup = this.add.text(cable.x, cable.y - 15, '+10 ' + (type === 'cable_fiber' ? '🔵 Fibra' : '🟡 UTP'), {
            fontSize: '14px', fill: '#ffff00', fontFamily: 'monospace', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);
        this.tweens.add({ targets: popup, y: popup.y - 40, alpha: 0, duration: 700, onComplete: () => popup.destroy() });
    }

    _collectPowerup(pu) {
        pu.destroy();
        this.player.lives = Math.min(this.player.lives + 1, this.player.maxLives);
        this.events.emit('update-lives', this.player.lives);
        const popup = this.add.text(pu.x, pu.y - 10, '❤️ +1 VIDA', {
            fontSize: '16px', fill: '#ff66aa', fontFamily: 'monospace', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);
        this.tweens.add({ targets: popup, y: popup.y - 50, alpha: 0, duration: 900, onComplete: () => popup.destroy() });
    }

    _touchLava() {
        this.player.takeDamage();
    }

    _fireProjectile(enemy) {
        const proj = this.projectiles.create(enemy.x, enemy.y, 'cable_utp');
        proj.setScale(0.03).setTint(0xff3300);
        proj.body.allowGravity = false;
        this.physics.moveToObject(proj, this.player.sprite, 280 + this.currentLevel * 20);
        this.tweens.add({ targets: proj, angle: 360, duration: 250, repeat: -1 });
        // Auto destruir si vive mucho
        this.time.delayedCall(4000, () => { if (proj.active) proj.destroy(); });
    }

    _placeBlock(x, y) {
        const key = this.inventory.useItem();
        if (!key) return;

        const snappedX = Math.round(x / 50) * 50 + 25;
        const snappedY = Math.round(y / 50) * 50 + 25;

        if (key === 'platform' || key.includes('ground')) {
            const block = this.platforms.create(snappedX, snappedY, 'platform')
                .setDisplaySize(50, 44).refreshBody();
            // Animación de colocación
            block.setAlpha(0);
            this.tweens.add({ targets: block, alpha: 1, duration: 150 });
        } else if (key.includes('cable')) {
            this.add.image(snappedX, snappedY, key).setDisplaySize(50, 12);
        } else if (key === 'router') {
            this.platforms.create(snappedX, snappedY, 'server')
                .setDisplaySize(44, 44).refreshBody();
        }
    }

    _triggerWin() {
        this._winTriggered = true;
        this.physics.pause();
        this.scene.stop('ui');

        const bonus = Math.max(0, Math.floor(30000 / (this.levelTime / 1000)));
        this.totalScore += bonus;

        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.time.delayedCall(600, () => {
            this.scene.start('game-win', {
                playerName: this.playerName,
                level: this.currentLevel,
                score: this.totalScore,
                lives: this.player.lives,
                timeBonus: bonus
            });
        });
    }

    _triggerGameOver() {
        this.physics.pause();
        this.scene.stop('ui');
        this.cameras.main.shake(300, 0.02);
        this.time.delayedCall(400, () => {
            this.scene.start('gameover', {
                playerName: this.playerName,
                score: this.totalScore,
                level: this.currentLevel
            });
        });
    }
}
