export class Enemy {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;
        this.hp = type === 'server' ? 3 : type === 'radar' ? 2 : 1;
        this.maxHp = this.hp;
        this.lastFired = 0;
        this.fireRate = type === 'radar' ? 1500 : type === 'server' ? 2500 : 2000;

        this.sprite = scene.enemies.create(x, y, type);
        this.sprite.setScale(0.09);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.enemyRef = this;

        // HP bar
        this.hpBg = scene.add.rectangle(x, y - 35, 40, 5, 0x330000).setOrigin(0.5);
        this.hpFill = scene.add.rectangle(x, y - 35, 40, 5, 0xff2200).setOrigin(0, 0.5);

        this._setupBehavior();
    }

    _setupBehavior() {
        const s = this.sprite;
        if (this.type === 'server') {
            s.setBounce(1);
            s.setVelocityX(Phaser.Math.RND.pick([-60, 60]));
            this.scene.tweens.add({ targets: s, scale: 0.11, duration: 600, yoyo: true, repeat: -1 });
        } else if (this.type === 'radar') {
            s.body.allowGravity = false;
            s.setVelocity(0, 0);
            const startY = s.y;
            this.scene.tweens.add({ targets: s, y: startY + 120, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.scene.tweens.add({ targets: s, angle: 360, duration: 3000, repeat: -1 });
        } else if (this.type === 'antenna') {
            s.body.allowGravity = false;
            s.setVelocityY(0);
            const startX = s.x;
            this.scene.tweens.add({ targets: s, x: startX + 200, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.scene.tweens.add({ targets: s, alpha: 0.4, duration: 300, yoyo: true, repeat: -1 });
        }
    }

    updateHPBar() {
        const ratio = Math.max(0, this.hp / this.maxHp);
        this.hpBg.setPosition(this.sprite.x - 20 + 20, this.sprite.y - 35);
        this.hpFill.setPosition(this.sprite.x - 20, this.sprite.y - 35);
        this.hpFill.setDisplaySize(40 * ratio, 5);
    }

    hit(damage = 1) {
        this.hp -= damage;
        this.scene.tweens.add({
            targets: this.sprite, alpha: 0.3, duration: 60, yoyo: true, repeat: 2,
            onStart: () => this.sprite.setTint(0xffffff),
            onComplete: () => this.sprite.clearTint()
        });
        this.updateHPBar();

        if (this.hp <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    die() {
        // Partículas de explosión
        for (let i = 0; i < 8; i++) {
            const part = this.scene.add.circle(
                this.sprite.x, this.sprite.y,
                Phaser.Math.Between(4, 10),
                Phaser.Math.RND.pick([0xff4400, 0xffaa00, 0xffffff])
            );
            this.scene.tweens.add({
                targets: part,
                x: part.x + Phaser.Math.Between(-80, 80),
                y: part.y + Phaser.Math.Between(-80, 80),
                alpha: 0, scale: 0,
                duration: Phaser.Math.Between(300, 600),
                onComplete: () => part.destroy()
            });
        }

        // Score popup
        const popup = this.scene.add.text(this.sprite.x, this.sprite.y - 20, '+' + (this.maxHp * 25), {
            fontSize: '18px', fill: '#ffff00', fontFamily: 'monospace',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);
        this.scene.tweens.add({
            targets: popup, y: popup.y - 50, alpha: 0, duration: 800,
            onComplete: () => popup.destroy()
        });

        this.scene.events.emit('enemy-killed', this.maxHp * 25, this.type);

        this.hpBg.destroy();
        this.hpFill.destroy();
        this.sprite.destroy();
    }
}
