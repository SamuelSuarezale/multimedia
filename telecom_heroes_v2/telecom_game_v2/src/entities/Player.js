export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.14);
        this.sprite.setBounce(0.05);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setGravityY(300);

        // Estado
        this.lives = 3;
        this.maxLives = 3;
        this.score = 0;
        this.isCrouching = false;
        this.isAttacking = false;
        this.isDashing = false;
        this.damageCooldown = false;
        this.healCooldown = false;
        this.dashCooldown = false;
        this.facingRight = true;

        // Hitbox de ataque
        this.attackHitbox = scene.add.rectangle(0, 0, 60, 40, 0xffff00, 0);
        scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.allowGravity = false;
        this.attackHitbox.active = false;

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.zKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.xKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Nombre flotante
        this.nameTag = scene.add.text(x, y - 60, scene.playerName || '', {
            fontSize: '13px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3,
            fontFamily: 'monospace'
        }).setOrigin(0.5).setScrollFactor(1);

        // Barra de vida sobre el jugador
        this.hpBarBg = scene.add.rectangle(x, y - 48, 50, 6, 0x330000).setOrigin(0.5);
        this.hpBar = scene.add.rectangle(x, y - 48, 50, 6, 0xff3333).setOrigin(0, 0.5);
    }

    update(time) {
        const onGround = this.sprite.body.touching.down || this.sprite.body.blocked.down;
        let speed = 220;

        // Agacharse
        if (this.cursors.down.isDown && onGround) {
            if (!this.isCrouching) {
                this.sprite.setScale(0.14, 0.07);
                this.sprite.body.updateFromGameObject();
                this.isCrouching = true;
            }
            speed = 80;
        } else if (this.isCrouching) {
            this.sprite.y -= 22;
            this.sprite.setScale(0.14);
            this.sprite.body.updateFromGameObject();
            this.isCrouching = false;
        }

        // DASH (X key)
        if (Phaser.Input.Keyboard.JustDown(this.xKey) && !this.dashCooldown && onGround) {
            const dir = this.facingRight ? 1 : -1;
            this.sprite.setVelocityX(dir * 600);
            this.isDashing = true;
            this.dashCooldown = true;
            this.sprite.setAlpha(0.5);
            this.scene.time.delayedCall(180, () => {
                this.isDashing = false;
                this.sprite.setAlpha(1);
            });
            this.scene.time.delayedCall(900, () => { this.dashCooldown = false; });
        }

        // Movimiento horizontal
        if (!this.isDashing) {
            if (this.cursors.left.isDown) {
                this.sprite.setVelocityX(-speed);
                this.sprite.flipX = true;
                this.facingRight = false;
            } else if (this.cursors.right.isDown) {
                this.sprite.setVelocityX(speed);
                this.sprite.flipX = false;
                this.facingRight = true;
            } else {
                this.sprite.setVelocityX(0);
            }
        }

        // Salto (doble salto)
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (onGround) {
                this.sprite.setVelocityY(-650);
                this.jumps = 1;
            } else if (this.jumps < 2) {
                this.sprite.setVelocityY(-500);
                this.jumps++;
                // Visual del doble salto
                this.scene.tweens.add({
                    targets: this.sprite, alpha: 0.6, duration: 80, yoyo: true
                });
            }
        }
        if (onGround) this.jumps = 0;

        // Ataque (Z)
        if (Phaser.Input.Keyboard.JustDown(this.zKey) && !this.isAttacking) {
            this.performAttack();
        }

        // Actualizar posición del nombre / barra HP
        this.nameTag.setPosition(this.sprite.x, this.sprite.y - 60);
        const hpRatio = Math.max(0, this.lives / this.maxLives);
        this.hpBarBg.setPosition(this.sprite.x - 25 + 25, this.sprite.y - 48);
        this.hpBar.setPosition(this.sprite.x - 25, this.sprite.y - 48);
        this.hpBar.setDisplaySize(50 * hpRatio, 6);

        // Actualizar hitbox de ataque
        if (this.isAttacking) {
            const dir = this.facingRight ? 1 : -1;
            this.attackHitbox.setPosition(this.sprite.x + dir * 55, this.sprite.y);
        }
    }

    performAttack() {
        this.isAttacking = true;
        this.attackHitbox.active = true;

        // Flash de ataque
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: this.facingRight ? 0.18 : -0.18,
            duration: 80, yoyo: true,
            onComplete: () => {
                this.isAttacking = false;
                this.attackHitbox.active = false;
            }
        });

        // Efecto visual del golpe
        const dir = this.facingRight ? 1 : -1;
        const slash = this.scene.add.rectangle(
            this.sprite.x + dir * 55, this.sprite.y, 50, 30, 0xffff00, 0.7
        );
        this.scene.tweens.add({
            targets: slash, alpha: 0, scaleX: 1.5,
            duration: 150, onComplete: () => slash.destroy()
        });
    }

    takeDamage() {
        if (this.damageCooldown) return false;
        if (this.isDashing) return false; // Invulnerable en dash

        this.lives -= 1;
        this.damageCooldown = true;

        // Efecto de parpadeo rojo
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0, duration: 80, yoyo: true, repeat: 5,
            onStart: () => this.sprite.setTint(0xff4444),
            onComplete: () => { this.sprite.clearTint(); this.sprite.setAlpha(1); }
        });

        // Knockback
        const knockDir = this.facingRight ? -1 : 1;
        this.sprite.setVelocity(knockDir * 200, -250);

        this.scene.time.delayedCall(1200, () => { this.damageCooldown = false; });
        return true;
    }

    heal() {
        if (this.healCooldown || this.lives >= this.maxLives) return false;
        this.lives = Math.min(this.lives + 1, this.maxLives);
        this.scene.tweens.add({
            targets: this.sprite, tint: 0x00ffaa, duration: 300,
            onComplete: () => this.sprite.clearTint()
        });
        this.healCooldown = true;
        this.scene.time.delayedCall(2500, () => { this.healCooldown = false; });
        return true;
    }

    destroy() {
        this.nameTag.destroy();
        this.hpBar.destroy();
        this.hpBarBg.destroy();
        this.attackHitbox.destroy();
        this.sprite.destroy();
    }
}
