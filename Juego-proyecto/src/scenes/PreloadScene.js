export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // --- 1. TERRAIN TILES (32x32) ---

        // Grass (Pradera)
        graphics.clear();
        graphics.fillStyle(0x4caf50); // Green
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x81c784); // Light green blades
        graphics.fillRect(5, 5, 2, 4);
        graphics.fillRect(20, 15, 2, 5);
        graphics.fillRect(10, 25, 3, 3);
        graphics.generateTexture('tile_grass', 32, 32);

        // Mountain (Montaña - Bloquea)
        graphics.clear();
        graphics.fillStyle(0x795548); // Brown base
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x9e9e9e); // Grey rock
        graphics.fillTriangle(16, 2, 4, 30, 28, 30);
        graphics.fillStyle(0xffffff); // Snow cap
        graphics.fillTriangle(16, 2, 12, 12, 20, 12);
        graphics.generateTexture('tile_mountain', 32, 32);

        // Water (Agua)
        graphics.clear();
        graphics.fillStyle(0x2196f3); // Blue
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x64b5f6); // Waves
        graphics.fillRect(5, 8, 10, 2);
        graphics.fillRect(18, 20, 8, 2);
        graphics.generateTexture('tile_water', 32, 32);

        // City (Ciudad - Costo alto)
        graphics.clear();
        graphics.fillStyle(0x9e9e9e); // Concrete
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x607d8b); // Building top
        graphics.fillRect(4, 4, 10, 10);
        graphics.fillRect(18, 18, 10, 10);
        graphics.fillStyle(0x37474f); // Street
        graphics.fillRect(15, 0, 2, 32);
        graphics.fillRect(0, 15, 32, 2);
        graphics.generateTexture('tile_city', 32, 32);

        // --- 2. CABLES ---

        // Copper (Cobre - Naranja)
        graphics.clear();
        graphics.lineStyle(4, 0xff5722);
        graphics.moveTo(0, 16);
        graphics.lineTo(32, 16);
        graphics.strokePath();
        graphics.generateTexture('cable_copper', 32, 32);

        // Fiber (Fibra - Azul Neón)
        graphics.clear();
        graphics.lineStyle(6, 0x00e5ff, 0.5); // Glow
        graphics.moveTo(0, 16);
        graphics.lineTo(32, 16);
        graphics.strokePath();
        graphics.lineStyle(2, 0xffffff); // Core
        graphics.moveTo(0, 16);
        graphics.lineTo(32, 16);
        graphics.strokePath();
        graphics.generateTexture('cable_fiber', 32, 32);

        // --- 3. STRUCTURES ---

        // House (Pueblo - Destino)
        graphics.clear();
        graphics.fillStyle(0x795548); // Wood
        graphics.fillRect(6, 12, 20, 14);
        graphics.fillStyle(0xd32f2f); // Roof
        graphics.fillTriangle(16, 2, 4, 12, 28, 12);
        graphics.generateTexture('structure_house', 32, 32);

        // Server (Base - Origen)
        graphics.clear();
        graphics.fillStyle(0x263238); // Dark metal
        graphics.fillRect(4, 4, 24, 24);
        graphics.fillStyle(0x00e676); // Lights
        graphics.fillRect(6, 8, 4, 2);
        graphics.fillRect(6, 12, 4, 2);
        graphics.fillRect(6, 16, 4, 2);
        graphics.generateTexture('structure_server', 32, 32);

        // Tower (Repetidor)
        graphics.clear();
        graphics.lineStyle(2, 0x607d8b);
        graphics.strokeTriangle(16, 4, 8, 28, 24, 28);
        graphics.fillStyle(0xffeb3b); // Light
        graphics.fillCircle(16, 4, 3);
        graphics.generateTexture('structure_tower', 32, 32);
    }

    create() {
        this.scene.start('GameScene');
    }
}
