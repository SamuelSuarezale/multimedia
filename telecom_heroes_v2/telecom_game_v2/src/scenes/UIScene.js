export class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'ui' }); }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const game = this.scene.get('game');

        // ── TOP BAR ──────────────────────────────────────────────────
        this.add.rectangle(W / 2, 22, W, 44, 0x000000, 0.6);

        // Nivel / nombre
        this.levelText = this.add.text(12, 11, 'NIVEL 1', {
            fontSize: '15px', fill: '#00ff88', fontFamily: 'monospace', fontStyle: 'bold'
        });
        this.levelName = this.add.text(80, 11, '', {
            fontSize: '13px', fill: '#88ffcc', fontFamily: 'monospace'
        });

        // Score
        this.scoreText = this.add.text(W / 2, 11, '0 pts', {
            fontSize: '20px', fill: '#ffff00', fontFamily: 'monospace', fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        // Vidas (corazones)
        this.heartsGroup = [];
        this._buildHearts(3);

        // ── HOTBAR ───────────────────────────────────────────────────
        const barW = 340, barH = 70;
        const barX = W / 2, barY = H - 36;

        this.add.rectangle(barX, barY, barW, barH, 0x000000, 0.7)
            .setStrokeStyle(1, 0x00ff88, 0.6);

        const slotKeys = ['platform', 'cable_utp', 'cable_fiber', 'router'];
        const slotLabels = ['Bloque', 'UTP', 'Fibra', 'Router'];
        const slotIcons = ['platform', 'cable_utp', 'cable_fiber', 'server'];
        this.slotRects = [];
        this.slotCounts = [];

        const startX = barX - 150;

        slotKeys.forEach((key, i) => {
            const sx = startX + i * 100;

            const rect = this.add.rectangle(sx, barY, 84, 60, 0x111122)
                .setStrokeStyle(1, 0x334455);
            this.slotRects.push(rect);

            this.add.text(sx - 38, barY - 30, (i + 1).toString(), {
                fontSize: '12px', fill: '#ffff00', fontFamily: 'monospace'
            });

            try {
                this.add.image(sx, barY - 4, slotIcons[i]).setDisplaySize(32, 32);
            } catch (e) {}

            this.add.text(sx, barY + 14, slotLabels[i], {
                fontSize: '9px', fill: '#aaaacc', fontFamily: 'monospace'
            }).setOrigin(0.5);

            const cnt = this.add.text(sx + 28, barY - 26, '0', {
                fontSize: '15px', fill: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5);
            this.slotCounts.push(cnt);
        });

        // ── MINIMAP ──────────────────────────────────────────────────
        this.minimapBg = this.add.rectangle(W - 95, 60, 150, 24, 0x000000, 0.7)
            .setStrokeStyle(1, 0x00ff88, 0.4);
        this.minimapBar = this.add.rectangle(W - 167, 60, 0, 14, 0x00ff88, 0.8).setOrigin(0, 0.5);
        this.minimapIcon = this.add.triangle(W - 167, 60, 0, 8, 8, -8, -8, -8, 0x00ff88);
        this.add.text(W - 167, 73, 'META', {
            fontSize: '8px', fill: '#00ff88', fontFamily: 'monospace'
        }).setOrigin(0, 0.5);

        // ── LEVEL ANNOUNCE ───────────────────────────────────────────
        this.announceText = this.add.text(W / 2, H / 2, '', {
            fontSize: '36px', fill: '#00ff88', fontFamily: 'monospace', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.subAnnounce = this.add.text(W / 2, H / 2 + 50, '', {
            fontSize: '18px', fill: '#aaffdd', fontFamily: 'monospace',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);

        // ── ITEM SELECTED FLASH ──────────────────────────────────────
        this.selectedFlash = this.add.text(W / 2, H - 90, '', {
            fontSize: '15px', fill: '#00ffcc', fontFamily: 'monospace',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);

        // ── DASH INDICATOR ───────────────────────────────────────────
        this.add.text(12, H - 22, '(X) Dash  (Z) Ataque  ↑↑ Doble salto', {
            fontSize: '10px', fill: '#556655', fontFamily: 'monospace'
        });

        // ── EVENTOS ──────────────────────────────────────────────────
        game.events.on('update-lives', (lives) => this._updateHearts(lives), this);
        game.events.on('score-update', (score) => this._updateScore(score), this);
        game.events.on('inventory-updated', (items) => this._updateInventory(items), this);
        game.events.on('item-selected', (key) => this._selectSlot(key), this);
        game.events.on('cable-collected', (type) => this._flashCable(type), this);
        game.events.on('level-start', (n, name) => this._announceLevel(n, name), this);

        // Minimap update
        this.time.addEvent({
            delay: 100, loop: true, callback: () => this._updateMinimap(game)
        });

        this._selectSlot('platform');
    }

    _buildHearts(count) {
        this.heartsGroup.forEach(h => h.destroy());
        this.heartsGroup = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.text(this.cameras.main.width - 28 - i * 32, 11, '♥', {
                fontSize: '22px',
                fill: i < count ? '#ff4466' : '#330022',
                fontFamily: 'monospace'
            });
            this.heartsGroup.push(heart);
        }
    }

    _updateHearts(lives) { this._buildHearts(Math.max(0, lives)); }

    _updateScore(score) {
        this.scoreText.setText(score.toLocaleString() + ' pts');
    }

    _updateInventory(items) {
        const keys = ['platform', 'cable_utp', 'cable_fiber', 'router'];
        keys.forEach((k, i) => {
            this.slotCounts[i].setText((items[k] || 0).toString());
        });
    }

    _selectSlot(key) {
        const keys = ['platform', 'cable_utp', 'cable_fiber', 'router'];
        keys.forEach((k, i) => {
            if (k === key) {
                this.slotRects[i].setStrokeStyle(2, 0x00ff88);
                this.slotRects[i].setFillStyle(0x002211);
            } else {
                this.slotRects[i].setStrokeStyle(1, 0x334455);
                this.slotRects[i].setFillStyle(0x111122);
            }
        });
        const labels = { platform: 'Bloque', cable_utp: 'Cable UTP', cable_fiber: 'Fibra Óptica', router: 'Router' };
        this.selectedFlash.setText('[ ' + (labels[key] || key) + ' ]').setAlpha(1);
        this.tweens.add({ targets: this.selectedFlash, alpha: 0, duration: 1200, delay: 600 });
    }

    _flashCable(type) {
        const msg = type === 'cable_fiber' ? '+1 Fibra Óptica' : '+1 Cable UTP';
        const flash = this.add.text(this.cameras.main.width / 2, 90, msg, {
            fontSize: '16px', fill: type === 'cable_fiber' ? '#44aaff' : '#ffdd00',
            fontFamily: 'monospace', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);
        this.tweens.add({ targets: flash, y: 70, alpha: 0, duration: 900, onComplete: () => flash.destroy() });
    }

    _announceLevel(n, name) {
        this.levelText.setText('NVL ' + n);
        this.levelName.setText(name);
        this.announceText.setText('NIVEL ' + n).setAlpha(1);
        this.subAnnounce.setText(name).setAlpha(1);
        this.tweens.add({ targets: [this.announceText, this.subAnnounce], alpha: 0, duration: 600, delay: 2000 });
    }

    _updateMinimap(game) {
        if (!game || !game.player) return;
        const mapW = game.levelConfig ? game.levelConfig.mapWidth : 6400;
        const px = game.player.sprite.x;
        const ratio = px / mapW;
        const barMaxW = 140;
        this.minimapBar.setDisplaySize(barMaxW * ratio, 14);
        this.minimapIcon.setPosition(this.cameras.main.width - 167 + barMaxW * ratio, 60);
    }
}
