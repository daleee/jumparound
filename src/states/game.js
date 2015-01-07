module.exports = {
    // state variables
    facing: 'right',
    autoJumpEnabled: false,
    pauseText: null, // TODO: handle this better...
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

        game.stage.backgroundColor = '#6380A1';
        game.add.sprite(0, 0, 'background');

        // add tilemap & associated tilesets
        map = game.add.tilemap('map');
        map.addTilesetImage('Tileset');
        map.setCollisionBetween(1, 1000);
        platformLayer = map.createLayer('Platforms');
        platformLayer.resizeWorld();

        // create player & define player animations
        var playerSpawn = map.objects.Triggers[0]; // TODO: un-hardcore index of player spawn
        // issue with tiled object layers require offsetting all
        // object tiles by Y-1 units. See
        // https://github.com/bjorn/tiled/issues/91 for more details
        player = game.add.sprite(playerSpawn.x, (playerSpawn.y - map.tileWidth), 'Player');
        player.animations.add('idle', [19], 10, false);
        player.animations.add('left', [26, 27, 28, 29], 10, true);
        player.animations.play('idle');
        player.anchor.setTo(0.5, 0.5);

        // initialize world physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(player);
        game.physics.arcade.gravity.y = 300;
        player.body.collideWorldBounds = true;
        player.body.gravity.y = 1250;
        player.body.maxVelocity.y = 500;

        game.time.advancedTiming = true; // TODO: put behind debug flag
        // this populates game.time.fps variables

        // initializ input references
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        autoJumpToggleKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
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
        // check for world collision
        game.physics.arcade.collide(player, platformLayer);

        // reset movement
        player.body.velocity.x = 0;

        if (leftKey.isDown) {
            player.body.velocity.x = -150;

            if (this.facing != 'left') {
                player.animations.play('left');
                player.scale.x *= -1;
                this.facing = 'left';
            }
        }
        else if (rightKey.isDown) {
            player.body.velocity.x = 150;

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

        if (jumpKey.isDown && player.body.onFloor() ||
            this.autoJumpEnabled && player.body.onFloor()) {
            /// number achieved via playtesting
            player.body.velocity.y = -player.body.maxVelocity.y;
        }
    },
    render: function () {
        game.debug.text('fps: ' + game.time.fps || '--', 1200, 24);
        game.debug.bodyInfo(player, 16, 24);
    }
};
