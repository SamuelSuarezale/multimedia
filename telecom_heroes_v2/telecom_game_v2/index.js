import { BootScene } from './src/scenes/BootScene.js';
import { MenuScene } from './src/scenes/MenuScene.js';
import { GameScene } from './src/scenes/GameScene.js';
import { UIScene } from './src/scenes/UIScene.js';
import { GameOverScene } from './src/scenes/GameOverScene.js';
import { GameWinScene } from './src/scenes/GameWinScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0a1a',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 500 }, debug: false }
    },
    scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene, GameWinScene]
};

window.TelecomGame = new Phaser.Game(config);
