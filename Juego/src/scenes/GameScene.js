import { Player } from "../core/Player.js";
import { ShortRangeAntenna } from "../core/Antenna.js";
import { NetworkNode } from "../core/NetworkNode.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("player", "assets/player.png");
    this.load.image("antenna", "assets/antenna.png");
    this.load.image("node", "assets/node.png");
  }

  create() {

    // ===== MAPA =====
    this.map = this.add.rectangle(0, 0, 3000, 3000, 0x1f1f1f).setOrigin(0);

    // ===== MUNDO CON LÍMITES =====
    this.physics.world.setBounds(0, 0, 3000, 3000);

    // ===== JUGADOR =====
    this.player = new Player(this, 400, 300);

    // ===== ANTENA =====
    this.antenna = new ShortRangeAntenna(this, 800, 350);

    // ===== NODO =====
    this.node = new NetworkNode(this, 1100, 380);

    // ===== LÍNEA =====
    this.link = this.add.line(0, 0, 0, 0, 0, 0, 0x00ff00)
      .setLineWidth(2);

    // ===== CÁMARA =====
    this.cameras.main.setBounds(0, 0, 3000, 3000);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);
  }

  update() {
    this.player.update();

    // ✅ ACTUALIZA LÍNEA EN TIEMPO REAL
    this.link.setTo(
      this.antenna.x, this.antenna.y,
      this.node.x, this.node.y
    );
  }
}
