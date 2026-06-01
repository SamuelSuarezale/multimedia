export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');

        // Configuración Física
        this.sprite.setScale(0.15);
        this.sprite.setBounce(0.1);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setGravityY(800);

        // Estado
        this.lives = 3;
        this.isCrouching = false;
        this.damageCooldown = false;
        this.healCooldown = false;

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    update() {
        let speed = 200;

        // --- AGACHARSE ---
        if (this.cursors.down.isDown) {
            if (!this.isCrouching) {
                this.sprite.setScale(0.15, 0.075);
                this.sprite.body.updateFromGameObject();
                this.isCrouching = true;
            }
            speed = 100; // Velocidad reducida
        } else {
            if (this.isCrouching) {
                this.sprite.y -= 25; // Corrección posición
                this.sprite.setScale(0.15);
                this.sprite.body.updateFromGameObject();
                this.isCrouching = false;
            }
        }

        // --- MOVIMIENTO HORIZONTAL ---
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-speed);
            this.sprite.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(speed);
            this.sprite.flipX = false;
        } else {
            this.sprite.setVelocityX(0);
        }

        // --- SALTO ---
        // Permitimos salto si toca suelo. Si el usuario quiere "high jump" siempre, mantenemos -700.
        if (this.cursors.up.isDown && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-700);
        }
    }

    takeDamage() {
        if (!this.damageCooldown) {
            this.lives -= 1;
            // Visual feedback
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 100,
                yoyo: true,
                repeat: 5
            });

            this.damageCooldown = true;
            this.scene.time.delayedCall(1000, () => { this.damageCooldown = false; });

            return true; // Daño aceptado
        }
        return false; // En cooldown
    }

    heal() {
        if (!this.healCooldown && this.lives < 3) {
            this.lives += 1;
            this.scene.tweens.add({
                targets: this.sprite,
                tint: 0x0000ff,
                duration: 200,
                yoyo: true,
                repeat: 1,
                onComplete: () => this.sprite.clearTint()
            });
            this.healCooldown = true;
            this.scene.time.delayedCall(2000, () => { this.healCooldown = false; });
            return true;
        }
        return false;
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}
