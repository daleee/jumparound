// Player must be created after physics system is initialized
var Player = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'Player');
    // initialize class variables
    this.deaths = 0;
    this.facing = 'right';
    this.smoothed = false;
    this.groundSpeed = 150;
    this.maxVelocity = 500;
    this.speedMultiplier = 2;
    this.speedEnabled = false;
    this.autoJumpEnabled = false;

    // set animations
    this.animations.add('idle', [19], 10, false);
    this.animations.add('left', [26, 27, 28, 29], 10, true);
    this.animations.play('idle');

    // physics properties
    this.game.physics.enable(this);
    this.anchor.setTo(0.5, 0.5);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 1250;
    this.body.maxVelocity.y = this.maxVelocity;
    this.body.setSize(12, 20, 0, 1); // set bounding box to be 12x20, starting at (0,1)

    // initialize input (keybpard)
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.jumpKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
    this.speedKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.autoJumpToggleKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
    // callbacks for input that isn't necessary for movement
    // the 'onDown' signal is only triggered once per key down
    // TODO: put this behind a dev flag
    this.autoJumpToggleKey.onDown.add(function (key) {
        this.autoJumpEnabled = !this.autoJumpEnabled;
    }, this);
    this.pauseKey.onDown.add(function (key) {
        if (this.game.paused) {
            this.game.paused = false;
        }
        else {
            this.game.paused = true;
        }
    }, this);


    // add sprite to game stage/world
    this.game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    // reset player movement
    this.body.velocity.x = 0;

    // move left/right
    if (this.leftKey.isDown) {
        this.body.velocity.x = -this.groundSpeed;

        if (this.facing != 'left') {
            this.animations.play('left');
            this.scale.x *= -1;
            this.facing = 'left';
        }
    }
    else if (this.rightKey.isDown) {
        this.body.velocity.x = this.groundSpeed;
        
        if (this.facing != 'right') {
            if (this.facing === 'left') {
                this.scale.x *= -1;
            }
            this.animations.play('left');
            this.facing = 'right';
        }
    }
    // go idle
    else {
        if (this.facing != 'idle') {
            if (this.facing === 'left') {
                this.scale.x *= -1;
            }
            this.animations.play('idle');
            this.facing = 'idle';
        }
    }

    // use speed key to run!
    if (this.speedKey.isDown) {
        this.speedEnabled = true;
        this.body.velocity.x *= this.speedMultiplier;
    }
    else {
        if (this.speedEnabled) {
            this.speedEnabled = false;
        }
    }

    // jumping
    if (this.jumpKey.isDown && this.body.onFloor() ||
        this.autoJumpEnabled && this.body.onFloor()) {
        /// number achieved via playtesting
        this.body.velocity.y = -this.body.maxVelocity.y;
    }
};

Player.prototype.destroy = function () {};

module.exports = Player;
