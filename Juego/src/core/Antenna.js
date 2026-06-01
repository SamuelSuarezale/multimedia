export const TX_POWER_DBM = 20;

export class Antenna extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "antenna");
    scene.add.existing(this);

    this.txPower = TX_POWER_DBM;
    this.setDisplaySize(32, 32);
  }
}

export class ShortRangeAntenna extends Antenna {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.range = 150;
  }
}
