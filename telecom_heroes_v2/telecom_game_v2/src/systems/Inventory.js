export class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.items = {
            'platform': 8,
            'cable_utp': 0,
            'cable_fiber': 0,
            'router': 2
        };
        this.slots = ['platform', 'cable_utp', 'cable_fiber', 'router'];
        this.selected = 0;
    }

    getSelectedKey() { return this.slots[this.selected]; }

    selectIndex(i) {
        if (i >= 0 && i < this.slots.length) {
            this.selected = i;
            this.scene.events.emit('item-selected', this.slots[i]);
        }
    }

    addItem(key, amount = 1) {
        if (this.items[key] !== undefined) this.items[key] += amount;
        else this.items[key] = amount;
        this.scene.events.emit('inventory-updated', { ...this.items });
    }

    useItem() {
        const key = this.getSelectedKey();
        if (this.items[key] > 0) {
            this.items[key]--;
            this.scene.events.emit('inventory-updated', { ...this.items });
            return key;
        }
        return null;
    }

    canUse() {
        return this.items[this.getSelectedKey()] > 0;
    }
}
