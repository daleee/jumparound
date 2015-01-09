(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.game = new Phaser.Game(1280, 720, Phaser.AUTO);

game.state.add('boot', require('./states/boot.js') );
game.state.add('load', require('./states/load.js') );
game.state.add('menu', require('./states/menu.js') );
game.state.add('game', require('./states/game.js') );
game.state.start('boot');

},{"./states/boot.js":2,"./states/game.js":3,"./states/load.js":4,"./states/menu.js":5}],2:[function(require,module,exports){
module.exports = {
    init: function () {
        //Add here your scaling options
    },

    preload: function () {
        //Load just the essential files for the loading screen,
        //they will be used in the Load State
    },

    create: function () {
        console.log('create: in boot state');
        game.state.start('load');
    }
};

},{}],3:[function(require,module,exports){
module.exports = {
    // state variables
    // TODO: put this in a separate sprite class
    facing: 'right',
    maxVelocity: 500,
    groundSpeed: 150,
    speedMultiplier: 2,
    speedEnabled: false,
    autoJumpEnabled: false,
    playerSpawn: null,
    playerDeaths: 0,
    levelComplete: false,
    timeCurrent: 0,
    timeOverall: 0,
    timeLevelStart: 0,
    timerText: null,
    pauseText: null, 
    deathSubText: null,
    deathText: null,
    deathSubTextTween: null,
    deathTextTween: null,
    levelKey: null,
    keyText: null,
    keyUIEmpty: null,
    keyUIFull: null,
    // methods
    preload: function () {
        game.load.tilemap('map', 'assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('Tileset', 'assets/images/spritesheet.png');
        game.load.image('background', 'assets/images/bg.png');
        // spritesheet(key to use, url, tile width, tile height, ???, sheet margin, tile padding)
        game.load.spritesheet('Player', 'assets/images/spritesheet.png', 21, 21, -1, 2, 2);
    },
    create: function () {
        console.log('create: in game state');

        game.add.sprite(0, 0, 'background');

        // add tilemap & associated tilesets
        map = game.add.tilemap('map');
        map.addTilesetImage('Tileset');
        // TODO: better way of setting all of these collisions
        map.setCollisionBetween(122, 126);
        map.setCollisionBetween(152, 166);
        map.setCollisionBetween(362, 365);
        map.setCollisionBetween(391, 395);
        platformLayer = map.createLayer('Platforms');
        platformLayer.resizeWorld();
        // define some tiles to have certain actions on collision
        map.setTileIndexCallback([573, 574, 575], this.killPlayer, this);
        map.setTileIndexCallback(138, this.completeLevel, this);

        // create some UI elements
        this.timerText = game.add.text(32,
                                       32,
                                       'Time: --:--',
                                       { font: "20px Arial",
                                         fill: '#000',
                                         keys: null,
                                         align: 'left'});
        this.deathText = game.add.text(game.world.centerX,
                                       game.world.centerY - 65,
                                       'DIED',
                                       { font: "65px Arial",
                                         fill: '#000',
                                         keys: null,
                                         align: 'center'});
        this.deathSubText = game.add.text(game.world.centerX,
                                          game.world.centerY + 10,
                                          'You died X times.',
                                          { font: "20px Arial",
                                            fill: '#000',
                                            align: 'center'});
        this.deathText.alpha = 0;
        this.deathSubText.alpha = 0;
        this.deathTextTween = game.add.tween(this.deathText).to({alpha: 0}, 1000);
        this.deathSubTextTween = game.add.tween(this.deathSubText).to({alpha: 0}, 1000);
        this.keyUIEmpty = game.add.image(32, 55, 'Player', 407);
        this.keyUIFull = game.add.image(32, 55, 'Player', 403);
        this.keyUIFull.alpha = 0; // hide this image at first

        // create player & define player animations
        this.playerSpawn = map.objects.Triggers[0]; // TODO: un-hardcore index of player spawn
        // issue with tiled object layers require offsetting all
        // object tiles by Y-1 units. See
        // https://github.com/bjorn/tiled/issues/91 for more details
        player = game.add.sprite(this.playerSpawn.x, (this.playerSpawn.y - map.tileWidth), 'Player');
        player.smoothed = false;
        player.animations.add('idle', [19], 10, false);
        player.animations.add('left', [26, 27, 28, 29], 10, true);
        player.animations.play('idle');
        // define some player actions, like what happens on death
        player.events.onKilled.add(this.onDeath, this);

        // initialize world physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(player);
        game.physics.arcade.gravity.y = 300;
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.body.gravity.y = 1250;
        player.body.maxVelocity.y = this.maxVelocity;
        player.body.setSize(12, 20, 0, 1); // set bounding box to be 12x20, starting at (0,1)
        game.time.advancedTiming = true; // TODO: put behind debug flag
        // this populates game.time.fps variables

        // create world objects
        var keys = map.objects.Keys;
        this.levelKey = game.add.sprite(keys[0].x, keys[0].y - 21, 'Player', keys[0].gid - 1);
        game.physics.enable(this.levelKey);
        // cheap way to have the key a 'physical body' yet not be
        // affected by physics.
        this.levelKey.body.allowGravity = false;
        // these 2 lines prevent phaser from separating objects when they collide.
        // all we want to know is that a collision happened, we don't want the bodies
        // to react realistically here
        this.levelKey.body.customSeparateX = true;
        this.levelKey.body.customSeparateY = true;
        this.timeLevelStart = game.time.now;

        // initializ input references
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        speedKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        autoJumpToggleKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
        // prevent pausing from resetting the input states
        Phaser.Input.resetLocked = true; // TODO: not working???
        // callbacks for input that isn't necessary for movement
        // the 'onDown' signal is only triggered once per key down
        // TODO: put this behind a dev flag
        autoJumpToggleKey.onDown.add(function (key) {
            this.autoJumpEnabled = !this.autoJumpEnabled;
        }, this);
        pauseKey.onDown.add(function (key) {
            if (game.paused) {
                this.pauseText.destroy();
                game.paused = false;
            }
            else {
                game.paused = true;
                this.pauseText = game.add.text(game.world.centerX,
                                    game.world.centerY,
                                    'PAUSED',
                                    { font: "65px Arial",
                                      fill: '#000',
                                      align: 'center'});
            }
        }, this);
    },
    update: function () {
        // update ui timer while the level is incomplete
        if (!this.levelComplete) {
            this.updateTimer();
        }

        // check for collisions
        game.physics.arcade.collide(player, platformLayer);
        game.physics.arcade.collide(player, this.levelKey, this.collectKey, null, this);

        // reset movement
        player.body.velocity.x = 0;

        // move left/right
        if (leftKey.isDown) {
            player.body.velocity.x = -this.groundSpeed;

            if (this.facing != 'left') {
                player.animations.play('left');
                player.scale.x *= -1;
                this.facing = 'left';
            }
        }
        else if (rightKey.isDown) {
            player.body.velocity.x = this.groundSpeed;

            // TODO: get animation frames for 'right'
            if (this.facing != 'right') {
                if (this.facing === 'left') {
                    player.scale.x *= -1;
                }
                player.animations.play('left');
                this.facing = 'right';
            }
        }
        else {
            if (this.facing != 'idle') {
                if (this.facing === 'left') {
                    player.scale.x *= -1;
                }
                player.animations.play('idle');
                this.facing = 'idle';
            }
        }

        // use speed key to run!
        if (speedKey.isDown) {
            this.speedEnabled = true;
            player.body.velocity.x *= this.speedMultiplier;
        }
        else {
            if (this.speedEnabled) {
                this.speedEnabled = false;
            }
        }

        // jumping
        if (jumpKey.isDown && player.body.onFloor() ||
            this.autoJumpEnabled && player.body.onFloor()) {
            /// number achieved via playtesting
            player.body.velocity.y = -player.body.maxVelocity.y;
        }
    },
    render: function () {
        // DEBUG STUFF - turn off for production
        game.debug.text('fps: ' + game.time.fps || '--', 1200, 24);
        //game.debug.body(player); // draw AABB box for player
        //game.debug.bodyInfo(player, 16, 24);
        // END DEBUG STUFF
    },
    updateTimer: function () {
        this.timeCurrent = (game.time.now - this.timeLevelStart) / 1000;
        this.timerText.setText('Time: ' + this.timeCurrent.toFixed(2));
        
    },
    killPlayer: function (player, spikesLayer) {
        if (player.alive) {
            player.kill();
        }
    },
    collectKey: function (player, key) {
        key.alpha = 0;
        key.body.enabled = false;
        this.keyUIFull.alpha = 1; // display keyUIFull in UI
        this.openDoor();
    },
    openDoor: function () {
        map.replace(167, 137, 0, 0, 50, 34);
        map.replace(168, 138, 0, 0, 50, 34);
    },
    closeDoor: function () {
        map.replace(137, 167, 0, 0, 50, 34);
        map.replace(138, 168, 0, 0, 50, 34);
    },
    completeLevel: function (player, doorExit) {
        this.levelComplete = true;
        this.timeOverall += this.timeCurrent;
        player.body.moves = false;
        game.input.enabled = false;
        // TODO: play little animation:
    },
    onDeath: function (player) {
        this.playerDeaths += 1;
        this.showDeathText();
        this.resetLevel();
        this.respawnPlayer(player);
    },
    showDeathText: function () {
        this.deathSubText.setText('You died ' + this.playerDeaths + ((this.playerDeaths === 1) ? ' time.' : ' times.'));
        this.deathText.alpha = 1;
        this.deathSubText.alpha = 1;
        this.deathTextTween.start();
        this.deathSubTextTween.start();
    },
    resetLevel: function () {
        this.closeDoor();
        this.keyUIFull.alpha = 0;
        this.levelKey.body.enabled = true;
        this.levelKey.alpha = 1;
    },
    respawnPlayer: function (player) {
        player.reset(this.playerSpawn.x, (this.playerSpawn.y - 20));
    }
};

},{}],4:[function(require,module,exports){
module.exports = {
    preload: function () {
        
    },
    create: function () {
        console.log('create: in load state');
        game.state.start('menu');
    }
};

},{}],5:[function(require,module,exports){
module.exports = {
    preload: function () {
        
    },
    create: function () {
        console.log('create: in menu state');
        game.state.start('game');
    }
};

},{}]},{},[1]);
