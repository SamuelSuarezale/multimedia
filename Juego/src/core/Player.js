export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(32, 32);
    this.setCollideWorldBounds(true);

    this.keys = scene.input.keyboard.createCursorKeys();
    this.speed = 250; // ✅ MÁS RÁPIDO
  }

  update() {
    this.setVelocity(0);

    if (this.keys.left.isDown) this.setVelocityX(-this.speed);
    if (this.keys.right.isDown) this.setVelocityX(this.speed);
    if (this.keys.up.isDown) this.setVelocityY(-this.speed);
    if (this.keys.down.isDown) this.setVelocityY(this.speed);
  }
}
