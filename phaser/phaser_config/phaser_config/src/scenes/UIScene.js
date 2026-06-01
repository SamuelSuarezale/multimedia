export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ui' });
    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        // --- HOTBAR ---
        this.hotbarBg = this.add.rectangle(this.width / 2, this.height - 50, 400, 80, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff);

        this.slots = [];
        this.texts = [];
        const items = ['ground_stone', 'cable_utp', 'cable_fiber', 'router'];

        let startX = (this.width / 2) - 150;
        items.forEach((item, index) => {
            let slot = this.add.rectangle(startX + (index * 100), this.height - 50, 80, 60, 0x333333)
                .setStrokeStyle(1, 0x888888);

            try { this.add.image(startX + (index * 100), this.height - 50, item).setDisplaySize(40, 40); }
            catch (e) { this.add.text(startX + (index * 100), this.height - 50, item[0]); }

            this.add.text(startX + (index * 100) - 35, this.height - 85, (index + 1).toString(), { fontSize: '14px', fill: '#ffff00' });
            let countText = this.add.text(startX + (index * 100) + 15, this.height - 40, '0', { fontSize: '18px', fill: '#ffffff', stroke: '#000000', strokeThickness: 2 });
            this.slots.push({ rect: slot, key: item });
            this.texts.push(countText);
        });

        // Listeners
        const gameScene = this.scene.get('game');
        gameScene.events.on('inventory-updated', this.updateInventory, this);
        gameScene.events.on('item-selected', this.selectSlot, this);
        this.selectSlot('ground_stone');

        // --- HEARTS (VIDAS) ---
        this.heartsGroup = this.add.group();
        this.createHearts(3);

        gameScene.events.on('update-lives', (lives) => {
            this.updateHearts(lives);
        });

        // Score texto
        this.scoreText = this.add.text(20, 70, 'Cables: 0', {
            fontSize: '24px', fill: '#ffff00', stroke: '#000000', strokeThickness: 3
        });
        gameScene.events.on('inventory-updated', (items) => {
            // Podríamos sumar los cables aquí si queremos mostrar score
        });
    }

    createHearts(lives) {
        this.heartsGroup.clear(true, true);
        for (let i = 0; i < lives; i++) {
            // EMOJI CORAZÓN
            let heart = this.add.text(30 + (i * 40), 30, '❤️', { fontSize: '32px' }).setOrigin(0.5);
            this.heartsGroup.add(heart);
        }
    }

    updateHearts(lives) {
        this.createHearts(lives < 0 ? 0 : lives);
    }

    updateInventory(items) {
        this.slots.forEach((slot, index) => {
            if (items[slot.key] !== undefined) {
                this.texts[index].setText(items[slot.key].toString());
            }
        });
    }

    selectSlot(key) {
        this.slots.forEach(slot => {
            if (slot.key === key) slot.rect.setStrokeStyle(3, 0x00ff00);
            else slot.rect.setStrokeStyle(1, 0x888888);
        });
    }
}
