// Player must be created after physics system is initialized
var Player = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'Player');
    // initialize class variables
    this.deaths = 0;
    this.facing = 'right';
    this.smoothed = false;
    this.groundSpeed = 150;
    this.maxVelocity = 500;

    // set animations
    this.animations.add('idle', [19], 10, false);
    this.animations.add('left', [26, 27, 28, 29], 10, true);
    this.animations.play('idle');

    // physics properties
    game.physics.enable(this);
    this.anchor.setTo(0.5, 0.5);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 1250;
    this.body.maxVelocity.y = this.maxVelocity;
    this.body.setSize(12, 20, 0, 1); // set bounding box to be 12x20, starting at (0,1)

    // add sprite to game stage/world
    game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
};

module.exports = Player;
