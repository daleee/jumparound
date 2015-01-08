module.exports = {
    // state variables
    // TODO: put this in a separate sprite class
    facing: 'right',
    maxVelocity: 500,
    groundSpeed: 150,
    speedMultiplier: 2,
    speedEnabled: false,
    autoJumpEnabled: false,
    levelKeys: [],
    playerSpawn: null,
    playerDeaths: 0,
    pauseText: null, // TODO: handle this better...
    deathText: null,
    // methods
    preload: function () {
        game.load.tilemap('map', '../../assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('Tileset', '../../assets/images/spritesheet.png');
        game.load.image('background', '../../assets/images/bg.png');
        // spritesheet(key to use, url, tile width, tile height, ???, sheet margin, tile padding)
        game.load.spritesheet('Player', '../../assets/images/spritesheet.png', 21, 21, -1, 2, 2);
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
        map.setTileIndexCallback(575, this.killPlayer, this);

        // create some UI elements
        this.deathText = game.add.text(32,
                                       32,
                                       "Deaths: " + this.playerDeaths,
                                       {
                                           font: "16px Arial",
                                           fill: "#000",
                                           align: "left"
                                       });

        // create player & define player animations
        this.playerSpawn = map.objects.Triggers[0]; // TODO: un-hardcore index of player spawn
        // issue with tiled object layers require offsetting all
        // object tiles by Y-1 units. See
        // https://github.com/bjorn/tiled/issues/91 for more details
        player = game.add.sprite(this.playerSpawn.x, (this.playerSpawn.y - map.tileWidth), 'Player');
        player.animations.add('idle', [19], 10, false);
        player.animations.add('left', [26, 27, 28, 29], 10, true);
        player.animations.play('idle');
        // define some player actions, like what happens on death
        player.events.onKilled.add(this.onDeath, this);

        // create world objects
        var keys = map.objects.Keys;
        for (var i = 0; i < 1 ; i++) {
            this.levelKeys[i] = game.add.sprite(keys[i].x, keys[i].y - 20, 'Player', keys[i].gid - 1);
        };

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
        // check for collisions
        game.physics.arcade.collide(player, platformLayer);

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
    killPlayer: function (player, spikesLayer) {
        if (player.alive) {
            player.kill();
        }
    },
    onDeath: function (player) {
        this.playerDeaths += 1;
        // TODO: display YOU DIED text
        this.updateDeathText();
        this.respawnPlayer(player);
    },
    updateDeathText: function () {
        this.deathText.setText('Deaths: ' + this.playerDeaths);
    },
    respawnPlayer: function (player) {
        player.reset(this.playerSpawn.x, (this.playerSpawn.y - 20));
    }
};
