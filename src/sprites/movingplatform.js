var MovingPlatform = function (game, bmd, startingX, startingY, direction, speed, distance) {
    Phaser.Sprite.call(this, game, startingX, startingY, bmd);
    // initialize class variables
    this.smoothed = false;
    this.startingX = startingX;
    this.startingY = startingY;
    this.direction = direction;
    this.speed = speed || 150;
    this.distance = distance;
    this.destination = { x: 0, y: 0 };


    // physics properties
    game.physics.enable(this);
    this.body.allowGravity = false;

    // decide where the platform will be going
    if (this.direction === 'down') {
        this.destination.y = this.body.y + this.distance;
    }

    // add sprite to game stage/world
    game.add.existing(this);
};

MovingPlatform.prototype = Object.create(Phaser.Sprite.prototype);
MovingPlatform.prototype.constructor = MovingPlatform;

MovingPlatform.prototype.update = function () {
    var difference = 0;
    if (this.direction === 'down') {
        if (this.body.y + this.speed < this.destination.y) {
            this.body.velocity.y = this.speed;
        }
        else {
            difference = this.destination.y - this.body.y;
            this.body.velocity.y = difference;
            this.destination.y = this.body.y - this.distance;
            this.direction = 'up';
        }
    }
    else if (this.direction === 'up') {
        if (this.body.y - this.speed > this.destination.y) {
            this.body.velocity.y = -this.speed;
        }
        else {
            difference = this.body.y - this.destination.y;
            this.body.velocity.y = difference;
            this.destination.y = this.body.y + this.distance;
            this.direction = 'down';
        }
    }
    // TODO: implement left/right movement support
};

module.exports = MovingPlatform;
