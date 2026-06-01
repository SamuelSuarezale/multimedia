import { Menu } from './menu.js';
import { Game } from './game.js';
import { GameOver } from './gameover.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Menu, Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
