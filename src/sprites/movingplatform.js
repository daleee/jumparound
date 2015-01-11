// Player must be created after physics system is initialized
var MovingPlatform = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'MovingPlatform');
    // initialize class variables
    this.smoothed = false;
    this.groundSpeed = 150;
    this.maxVelocity = 500;

    // physics properties
    game.physics.enable(this);

    // add sprite to game stage/world
    game.add.existing(this);
};

MovingPlatform.prototype = Object.create(Phaser.Sprite.prototype);
MovingPlatform.prototype.constructor = MovingPlatform;

MovingPlatform.prototype.update = function () {
};

module.exports = MovingPlatform;
