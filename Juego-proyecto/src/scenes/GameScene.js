export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 1. Configuración del Mapa
        const mapWidth = 25;
        const mapHeight = 19;
        const tileSize = 32;

        // Generar Terreno Procedural Simple
        this.grid = [];
        for (let y = 0; y < mapHeight; y++) {
            const row = [];
            for (let x = 0; x < mapWidth; x++) {
                let type = 'tile_grass';
                const rand = Math.random();

                // Generación de biomas simple
                if (rand > 0.85) type = 'tile_mountain';
                else if (rand > 0.75) type = 'tile_water';
                else if (rand > 0.70) type = 'tile_city';

                // Crear tile visual
                const tile = this.add.image(x * tileSize + 16, y * tileSize + 16, type);
                tile.setInteractive();
                tile.setData('type', type);
                tile.setData('gridX', x);
                tile.setData('gridY', y);

                // Evento de construcción
                tile.on('pointerdown', () => this.onTileClick(tile));

                row.push(tile);
            }
            this.grid.push(row);
        }

        // 2. Estructuras Iniciales
        // Servidor Central (Origen)
        this.placeStructure(2, 2, 'structure_server');

        // Pueblo (Destino 1)
        this.placeStructure(20, 5, 'structure_house');

        // Hospital (Destino 2)
        this.placeStructure(15, 15, 'structure_house');

        // 3. UI y Estado
        this.selectedTool = 'cable_copper'; // Herramienta actual
        this.resources = { copper: 500, fiber: 200 };

        this.createUI();
    }

    placeStructure(x, y, key) {
        const tile = this.grid[y][x];
        this.add.image(tile.x, tile.y, key);
        tile.setData('hasStructure', true);
    }

    onTileClick(tile) {
        if (tile.getData('hasStructure')) return;

        const type = tile.getData('type');

        // Reglas de construcción
        if (type === 'tile_mountain' && this.selectedTool !== 'structure_tower') {
            this.showFloatingText(tile.x, tile.y, '¡Necesitas una Torre!', '#ff0000');
            return;
        }
        if (type === 'tile_water' && this.selectedTool === 'cable_copper') {
            this.showFloatingText(tile.x, tile.y, '¡El cobre no cruza agua!', '#ff0000');
            return;
        }

        // Construir
        if (this.selectedTool === 'cable_copper') {
            this.add.image(tile.x, tile.y, 'cable_copper');
            this.resources.copper -= 10;
        } else if (this.selectedTool === 'cable_fiber') {
            this.add.image(tile.x, tile.y, 'cable_fiber');
            this.resources.fiber -= 20;
        } else if (this.selectedTool === 'structure_tower') {
            this.add.image(tile.x, tile.y, 'structure_tower');
            this.resources.copper -= 50;
        }

        this.updateUI();
    }

    createUI() {
        // Panel Superior
        this.add.rectangle(400, 30, 800, 60, 0x333333);
        this.resourceText = this.add.text(20, 20, '', { fontSize: '20px', fill: '#fff' });

        // Botones de Herramientas (Abajo)
        const tools = [
            { key: 'cable_copper', label: 'Cobre (10)' },
            { key: 'cable_fiber', label: 'Fibra (20)' },
            { key: 'structure_tower', label: 'Torre (50)' }
        ];

        let x = 200;
        tools.forEach(tool => {
            const btn = this.add.image(x, 550, tool.key).setInteractive();
            this.add.text(x - 40, 580, tool.label, { fontSize: '14px', fill: '#000' });

            btn.on('pointerdown', () => {
                this.selectedTool = tool.key;
                this.showFloatingText(400, 300, `Herramienta: ${tool.label}`, '#000');
            });

            x += 150;
        });

        this.updateUI();
    }

    updateUI() {
        this.resourceText.setText(`Cobre: ${this.resources.copper} | Fibra: ${this.resources.fiber}`);
    }

    showFloatingText(x, y, message, color) {
        const text = this.add.text(x, y - 20, message, { fontSize: '16px', fill: color, stroke: '#fff', strokeThickness: 2 }).setOrigin(0.5);
        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }
}
