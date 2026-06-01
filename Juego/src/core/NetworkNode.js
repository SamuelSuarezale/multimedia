export class NetworkNode extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "node");
    scene.add.existing(this);
    this.setDisplaySize(32, 32);
  }
}
