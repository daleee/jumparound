var MovingPlatform = function (game, startingX, startingY, direction, speed, distance) {
    Phaser.Sprite.call(this, game, startingX, startingY, 'movingplatform');
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
    this.body.immovable = true;

    // decide where the platform will be going
    if (this.direction === 'down') {
        this.destination.y = this.body.y + this.distance;
    }
    else if (this.direction === 'up') {
        this.destination.y = this.body.y - this.distance;
    }
    else if (this.direction === 'left') {
        this.destination.x = this.body.x - this.distance;
    }
    else if (this.direction === 'right') {
        this.destination.x = this.body.x + this.distance;
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
    else if (this.direction === 'right') {
        if (this.body.x + this.speed < this.destination.x) {
            this.body.velocity.x = this.speed;
        }
        else {
            difference = this.destination.x - this.body.x;
            this.body.velocity.x = difference;
            this.destination.x = this.body.x - this.distance;
            this.direction = 'left';
        }
    }
    else if (this.direction === 'left') {
        if (this.body.x - this.speed > this.destination.x) {
            this.body.velocity.x = -this.speed;
        }
        else {
            difference = this.body.x - this.destination.x;
            this.body.velocity.x = difference;
            this.destination.x = this.body.x + this.distance;
            this.direction = 'right';
        }
    }
};

module.exports = MovingPlatform;
