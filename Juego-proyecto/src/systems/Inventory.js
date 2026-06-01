export class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.resources = {
            copper: 0,
            silicon: 0, // From sand/quartz
            iron: 0,
            plastic: 0  // From oil/organic
        };

        this.uiText = null;
        this.createUI();
    }

    createUI() {
        // Crear un texto fijo en la pantalla para mostrar recursos
        this.uiText = this.scene.add.text(10, 10, this.getText(), {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(100);
    }

    getText() {
        return `Cobre: ${this.resources.copper} | Silicio: ${this.resources.silicon} | Hierro: ${this.resources.iron}`;
    }

    updateUI() {
        if (this.uiText) {
            this.uiText.setText(this.getText());
        }
    }

    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] += amount;
            this.updateUI();
            return true;
        }
        return false;
    }
}
