var Player = require('../sprites/player.js');
var MovingPlatform = require('../sprites/movingplatform.js');

module.exports = {
    // state variables
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
        game.load.image('movingplatform', 'assets/images/movingplatform.png');
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

        // initialize world physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 300;
        // the following line populates game.time.fps variables
        game.time.advancedTiming = true; // TODO: put behind debug flag

        // create player 
        this.playerSpawn = map.objects.Triggers[0]; // TODO: un-hardcore index of player spawn
        // issue with tiled object layers require offsetting all
        // object tiles by Y-1 units. See
        // https://github.com/bjorn/tiled/issues/91 for more details
        player = new Player(game, this.playerSpawn.x, (this.playerSpawn.y - map.tileWidth));
        // define some player actions, like what happens on death
        player.events.onKilled.add(this.onDeath, this);

        // create world objects
        var keys = map.objects.Keys;
        this.levelKey = game.add.sprite(keys[0].x, keys[0].y - 21, 'Player', keys[0].gid - 1);
        game.physics.enable(this.levelKey);
        // spikes from tiles
        topSpikesGroup = game.add.group();
        topSpikesGroup.enableBody = true;
        topSpikesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        bottomSpikesGroup = game.add.group();
        bottomSpikesGroup.enableBody = true;
        bottomSpikesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        map.createFromTiles([571, 572, 573], null, 'Player', undefined, topSpikesGroup, { alpha: 0 });
        map.createFromTiles([574, 575, 576], null, 'Player', undefined, bottomSpikesGroup, { alpha: 0 });
        // need to iterate through each sprite and disable gravity, as well as fix hitbox size
        for (var i = 0; i < topSpikesGroup.children.length; i++) {
            topSpikesGroup.children[i].body.setSize(21, 11, 0, 0);
            topSpikesGroup.children[i].body.allowGravity = false;
        }
        for (var i = 0; i < bottomSpikesGroup.children.length; i++) {
            bottomSpikesGroup.children[i].body.setSize(21, 11, 0, 10);
            bottomSpikesGroup.children[i].body.allowGravity = false;
        }
        // cheap way to have the key a 'physical body' yet not be
        // affected by gravity.
        this.levelKey.body.allowGravity = false;
        // these 2 lines prevent phaser from separating objects when
        // they collide.  all we want to know is that a collision
        // happened, we don't want the bodies to react realistically
        // here
        this.levelKey.body.customSeparateX = true;
        this.levelKey.body.customSeparateY = true;

        // create the moving platform from tiled mapdata
        var platforms = map.objects.Platforms;
        platformsGroup = game.add.group();
        for(var i = 0; i < platforms.length; i++) {
            platformsGroup.add(new MovingPlatform(game,
                                                  platforms[i].x,
                                                  platforms[i].y,
                                                  platforms[i].properties.startingDir,
                                                  +platforms[i].properties.speed,
                                                  +platforms[i].properties.distance
                                                 )
                              );
        }

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
        
        // initialize timer
        this.timeLevelStart = game.time.now;
    },
    handlePlayerMovingPlatformCollision: function (player, platform) {
        if (player.body.touching.down) {
            player.body.blocked.down = true;
        }
    },
    update: function () {
        // update ui timer while the level is incomplete
        if (!this.levelComplete) {
            this.updateTimer();
        }

        // check for collisions
        game.physics.arcade.collide(player, platformLayer);
        game.physics.arcade.collide(player, platformsGroup, this.handlePlayerMovingPlatformCollision, null, this);

        game.physics.arcade.collide(player, this.levelKey, this.collectKey, null, this);
        if (game.physics.arcade.overlap(player, bottomSpikesGroup) || game.physics.arcade.overlap(player, topSpikesGroup)) {
            this.killPlayer(player);
        }

        // reset player movement
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
