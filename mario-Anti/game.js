const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.on('loaderror', function (file) {
        console.error('Error loading file: ' + file.key);
        alert('Error loading file: ' + file.key + '. Make sure you are running this game from a web server, not directly from the file system.');
    });

    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('dude', 'assets/player.png');
}

var platforms;
var player;
var cursors;
var score = 0;
var scoreText;
var lives = 3;
var livesText;
var bombs;
var stars;
var gameOver = false;
var timeLeft = 120;
var timeText;
var timerEvent;

function create() {
    // Sky is 1024x1024. Scale to cover 800x600.
    // 800 / 1024 = 0.78. Let's use 0.8 to be safe.
    this.add.image(400, 300, 'sky').setScale(0.8).setScrollFactor(0);

    this.physics.world.setBounds(0, 0, 1600, 600);
    this.cameras.main.setBounds(0, 0, 1600, 600);

    platforms = this.physics.add.staticGroup();

    // Ground is 1024x1024.
    // We want a floor. Scale Y to be thin (e.g. 0.1 = 100px height).
    // Scale X to cover width.
    platforms.create(400, 568, 'ground').setScale(2, 0.1).refreshBody();

    // Ledges
    platforms.create(600, 400, 'ground').setScale(0.3, 0.05).refreshBody();
    platforms.create(50, 250, 'ground').setScale(0.3, 0.05).refreshBody();
    platforms.create(750, 220, 'ground').setScale(0.3, 0.05).refreshBody();

    player = this.physics.add.sprite(100, 450, 'dude');
    // Player is 1024x1024. Scale to approx 50px height. 50/1024 = ~0.05
    player.setScale(0.05);

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms);

    // Animations removed because 'dude' is now a single image, not a spritesheet.
    /*
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    ...
    */

    cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.startFollow(player);

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        // Star is 1024x1024. Scale to approx 30px. 30/1024 = ~0.03
        child.setScale(0.03);
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    scoreText.setScrollFactor(0);

    livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '32px', fill: '#fff' });
    livesText.setScrollFactor(0);

    timeText = this.add.text(600, 16, 'Time: 120', { fontSize: '32px', fill: '#fff' });
    timeText.setScrollFactor(0);

    timerEvent = this.time.addEvent({ delay: 1000, callback: onTimerTick, callbackScope: this, loop: true });

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.flipX = true; // Flip image to face left
        // player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.flipX = false; // Face right
        // player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        // player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        // Bomb is 1024x1024. Scale to 0.03
        bomb.setScale(0.03);
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.body.allowGravity = false;
    }
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    // player.anims.play('turn');

    lives -= 1;
    livesText.setText('Lives: ' + lives);

    if (lives === 0) {
        gameOver = true;
        var gameOverText = this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#fff' });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        timerEvent.remove();
    } else {
        // Add a small delay before resetting
        this.time.delayedCall(1000, function () {
            this.physics.resume();
            player.clearTint();
            player.setPosition(100, 450);
        }, [], this);
    }
}

function onTimerTick() {
    if (gameOver) return;

    timeLeft -= 1;
    timeText.setText('Time: ' + timeLeft);

    if (timeLeft <= 0) {
        this.physics.pause();
        gameOver = true;
        var gameOverText = this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#fff' });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        timerEvent.remove();
    }
}
