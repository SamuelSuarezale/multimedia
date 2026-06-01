export class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.items = {
            'cable_utp': 0,
            'cable_fiber': 0,
            'ground_stone': 5, // Bloques iniciales
            'router': 1
        };
        this.selectedItem = 'ground_stone';
        this.hotbarSlots = ['ground_stone', 'cable_utp', 'cable_fiber', 'router'];
    }

    addItem(key, amount = 1) {
        if (this.items[key] !== undefined) {
            this.items[key] += amount;
        } else {
            this.items[key] = amount;
        }
        this.scene.events.emit('inventory-updated', this.items);
    }

    useItem(key) {
        if (this.items[key] > 0) {
            this.items[key]--;
            this.scene.events.emit('inventory-updated', this.items);
            return true;
        }
        return false;
    }

    selectItem(index) {
        if (index >= 0 && index < this.hotbarSlots.length) {
            this.selectedItem = this.hotbarSlots[index];
            this.scene.events.emit('item-selected', this.selectedItem);
            return this.selectedItem;
        }
    }

    getSelected() {
        return this.selectedItem;
    }
}
