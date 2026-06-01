export class LevelBuilder {
    constructor(scene) {
        this.scene = scene;
    }

    // Devuelve config del nivel según número
    getConfig(level) {
        const configs = {
            1: {
                name: 'Sector A: Red Caída',
                mapWidth: 4800,
                enemies: 8, enemyTypes: ['antenna'],
                cables: 10, extraLives: 1,
                bgTint: 0xffffff,
                gapChance: 0.08, gapSize: 150,
                platformCount: 20, hasBoss: false
            },
            2: {
                name: 'Sector B: Interferencia',
                mapWidth: 6400,
                enemies: 12, enemyTypes: ['antenna', 'server'],
                cables: 14, extraLives: 0,
                bgTint: 0xaaddff,
                gapChance: 0.12, gapSize: 200,
                platformCount: 28, hasBoss: false
            },
            3: {
                name: 'Sector C: Núcleo Hostil',
                mapWidth: 8000,
                enemies: 18, enemyTypes: ['antenna', 'server', 'radar'],
                cables: 18, extraLives: 0,
                bgTint: 0xffddaa,
                gapChance: 0.15, gapSize: 250,
                platformCount: 36, hasBoss: true
            }
        };
        return configs[level] || configs[3];
    }

    build(level, platforms, lavaGroup, waterGroup) {
        const cfg = this.getConfig(level);
        const w = cfg.mapWidth;

        // Suelo principal con huecos
        let x = 0;
        while (x < w) {
            if (x > 600 && Math.random() < cfg.gapChance) {
                // Insertar lava en hueco
                lavaGroup.create(x + cfg.gapSize / 2, 578, 'ground_lava')
                    .setDisplaySize(cfg.gapSize, 44).refreshBody();
                x += cfg.gapSize;
                continue;
            }
            platforms.create(x + 25, 578, 'platform').setDisplaySize(50, 44).refreshBody();
            x += 50;
        }

        // Agua curativa (2 zonas)
        waterGroup.create(w * 0.35, 578, 'ground_water').setDisplaySize(200, 44).refreshBody();
        waterGroup.create(w * 0.7, 578, 'ground_water').setDisplaySize(200, 44).refreshBody();

        // Plataformas elevadas
        const tileKeys = ['ground_dirt', 'ground_diamond', 'ground_gold', 'platform'];
        for (let i = 0; i < cfg.platformCount; i++) {
            const px = Phaser.Math.Between(500, w - 600);
            const py = Phaser.Math.Between(160, 480);
            const key = Phaser.Math.RND.pick(tileKeys);
            const len = Phaser.Math.Between(120, 280);
            platforms.create(px, py, key).setDisplaySize(len, 40).refreshBody();
        }

        // Plataformas especiales de lava en alto
        for (let i = 0; i < 4; i++) {
            const px = Phaser.Math.Between(1000, w - 1000);
            const py = Phaser.Math.Between(120, 350);
            lavaGroup.create(px, py, 'ground_lava').setDisplaySize(120, 38).refreshBody();
        }

        return cfg;
    }
}
