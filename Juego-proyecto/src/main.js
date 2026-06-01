import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down (Tower Defense)
            debug: false
        }
    },
    scene: [PreloadScene, GameScene]
};

const game = new Phaser.Game(config);
