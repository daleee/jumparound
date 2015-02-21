var Player = require('../sprites/player.js');
var MovingPlatform = require('../sprites/movingplatform.js');

module.exports = {
    create: function () {
        console.log('create: in game state');

        var i; // for later loops... ohhh, function scope!
        if (this.game.currentLevel === 1) {
            console.log('loading level 1');

            // add background image
            this.bg = this.game.add.sprite(0, 0, 'background');
            // add tilemap & associated tilesets
            this.map = this.game.add.tilemap('level1');
        }
        else if (this.game.currentLevel === 2) {
            console.log('loading level 2');

            this.bg = this.game.add.sprite(0, 0, 'background');
            this.map = this.game.add.tilemap('level2');
        }
        else if (this.game.currentLevel === 3) {
            console.log('loading level 3');

            this.bg = this.game.add.sprite(0, 0, 'background-castle');
            this.map = this.game.add.tilemap('level3');
        }

        // create shared level ccomponents
        this.bg.width = this.game.world.width;
        this.bg.height = this.game.world.width;
        this.map.addTilesetImage('Tileset');

        // create the physical world
        this.platformLayer = this.map.createLayer('Platforms');
        this.platformLayer.resizeWorld();
        if (this.game.currentLevel === 3) {
            this.fakePlatformLayer = this.map.createLayer('FakeTiles');
            this.fakePlatformLayer.resizeWorld();
        }

        // initialize world physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 300;
        // the following line populates game.time.fps variables
        this.game.time.advancedTiming = true; // TODO: put behind debug flag

        // set collisions with certain tiles (immovable world tiles)
        // all tile IDs in the spritesheet are offset by +1 here
        // exit sign, door closed #1, door closed #2, door open #1, door open #2, various spikes
        this.map.setCollisionByExclusion([254, 167, 168, 137, 138, 571, 572, 573, 574, 575, 576], true, this.platformLayer);

        // define some tiles to have certain actions on collision
        this.endFired = false;
        this.map.setTileIndexCallback(137, this.completeLevel, this, this.platformLayer);
        this.map.setTileIndexCallback(138, this.completeLevel, this, this.platformLayer);


        // create player 
        this.playerSpawn = this.map.objects.Triggers[0]; // TODO: un-hardcore index of player spawn
        // issue with tiled object layers require offsetting all
        // object tiles by Y-1 units. See
        // https://github.com/bjorn/tiled/issues/91 for more details
        this.player = new Player(this.game, this.playerSpawn.x, (this.playerSpawn.y - this.map.tileWidth)); 
        this.player.events.onKilled.add(this.onDeath, this);

        // create world objects
        var keys = this.map.objects.Keys;
        this.levelKey = this.game.add.sprite(keys[0].x, keys[0].y - 21, 'Player', keys[0].gid - 1);
        this.game.physics.enable(this.levelKey);
        this.game.physics.enable(this.platformLayer);
        // spikes from tiles
        this.topSpikesGroup = this.game.add.group();
        this.topSpikesGroup.enableBody = true;
        this.topSpikesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.bottomSpikesGroup = this.game.add.group();
        this.bottomSpikesGroup.enableBody = true;
        this.bottomSpikesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.map.createFromTiles([571, 572, 573], null, 'Player', this.platformLayer, this.topSpikesGroup, { alpha: 0 } );
        this.map.createFromTiles([574, 575, 576], null, 'Player', this.platformLayer, this.bottomSpikesGroup, { alpha: 0 } );
        // need to iterate through each sprite and disable gravity, as well as fix hitbox size
        for (i = 0; i < this.topSpikesGroup.children.length; i++) {
            this.topSpikesGroup.children[i].body.setSize(21, 11, 0, 0);
            this.topSpikesGroup.children[i].body.allowGravity = false;
        }
        for (i = 0; i < this.bottomSpikesGroup.children.length; i++) {
            this.bottomSpikesGroup.children[i].body.setSize(21, 11, 0, 10);
            this.bottomSpikesGroup.children[i].body.allowGravity = false;
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
        var platforms = null;
        if (this.map.objects.Platforms) {
            platforms = this.map.objects.Platforms;
        }
        this.platformsGroup = this.game.add.group();
        for(i = 0; i < platforms.length; i++) {
            this.platformsGroup.add(new MovingPlatform(this.game,
                                                  platforms[i].x,
                                                  platforms[i].y,
                                                  platforms[i].properties.startingDir,
                                                  +platforms[i].properties.speed,
                                                  +platforms[i].properties.distance
                                                 )
                              );
        }

        // create some UI elements
        this.timerText = this.game.add.bitmapText(58,
                                                  32,
                                                  'font',
                                                  'Time: --:--',
                                                  18);
        this.pauseText = this.game.add.bitmapText(0,
                                                  this.game.world.centerY,
                                                  'font',
                                                  'PAUSED',
                                                  65);
        this.pauseText.x = this.game.world.centerX - (this.pauseText.width / 2);
        this.pauseText.alpha = 0;
        this.deathText = this.game.add.bitmapText(0,
                                            this.game.world.centerY - 65,
                                            'font',
                                            'DIED',
                                            65);
        this.deathText.alpha = 0;
        this.deathText.x = this.game.world.centerX - (this.deathText.width / 2);
        this.deathSubText = this.game.add.text(0,
                                               this.game.world.centerY + 10,
                                               'You died X times.',
                                               { font: "20px Arial",
                                                 fill: '#fff',
                                                 align: 'center'});
        this.deathSubText.alpha = 0;
        this.deathSubText.stroke = '#000';
        this.deathSubText.strokeThickness = 6;
        this.lvlWinText = this.game.add.bitmapText(0,
                                                   this.game.world.centerY / 2,
                                                   'font',
                                                   'LEVEL COMPLETE!',
                                                   65);
        this.lvlWinSubText = this.game.add.text(0,
                                                (this.game.world.centerY / 2) + 85,
                                                'placeholder',
                                                { font: "45px Arial",
                                                  fill: '#fff',
                                                  align: 'left'});

        this.lvlWinCont = this.game.add.text(0,
                                             this.game.world.centerY + (this.game.world.centerY / 4),
                                             'Press C to CONTINUE!',
                                             {
                                                 font: '40px Arial',
                                                 fill: '#000',
                                                 stroke: '#fff',
                                                 strokeThickness: 3

                                             });
        
        this.lvlWinText.x = (this.game.world.centerX - (this.lvlWinText.width / 2));
        this.lvlWinCont.x = (this.game.world.centerX - (this.lvlWinCont.width / 2));
        this.lvlWinCont.alpha = 0;
        this.lvlWinText.alpha = 0;
        this.lvlWinSubText.alpha = 0;
        this.lvlWinSubText.stroke = '#000';
        this.lvlWinSubText.strokeThickness = 6;

        this.keyUIEmpty = this.game.add.image(32, 33, 'Player', 407);
        this.keyUIFull = this.game.add.image(32, 33, 'Player', 403);
        this.keyUIFull.alpha = 0; // hide this image at first

        // initialize audio sprites
        this.audioDeath = this.game.add.audio('a_Death');
        this.audioDeath.allowMultiple = true;
        this.audioKeyGet = this.game.add.audio('a_KeyGet');
        this.audioLevelWin = this.game.add.audio('a_LevelWin');

        // initialize events handlers
        this.game.onPause.add(this.onPause, this);
        this.game.onResume.add(this.onResume, this);
        // initialize timer
        this.timeLevelStart = this.game.time.now;
        this.timeCurrent = 0;
        this.levelComplete = false;
    },
    handlePlayerMovingPlatformCollision: function (player, platform) {
        if (player.body.touching.down) {
            player.body.blocked.down = true;
        }
    },
    update: function () {
        // update ui timer while the level is incomplete
        if (!this.levelComplete && !this.game.paused) {
            this.updateTimer();
        }

        if (this.levelComplete) {
            if (this.game.input.keyboard.isDown( Phaser.Keyboard.C ) ) {
                this.loadNextLevel();
            }
        }

        // check for collisions
        this.game.physics.arcade.collide(this.player, this.platformLayer);
        this.game.physics.arcade.collide(this.player, this.platformsGroup, this.handlePlayerMovingPlatformCollision, null, this);

        this.game.physics.arcade.collide(this.player, this.levelKey, this.collectKey, null, this);
        if (this.game.physics.arcade.overlap(this.player, this.bottomSpikesGroup) || this.game.physics.arcade.overlap(this.player, this.topSpikesGroup)) {
            this.killPlayer(this.player);
        }
    },
    render: function () {
        // DEBUG STUFF - turn off for production
        //this.game.debug.text('fps: ' + this.game.time.fps || '--', 950, 24);
        //game.debug.body(player); // draw AABB box for player
        //game.debug.bodyInfo(player, 16, 24);
        // END DEBUG STUFF
    },
    updateTimer: function () {
        this.timeCurrent += this.game.time.physicsElapsed;
        this.timerText.setText('Time: ' + this.timeCurrent.toFixed(2));
    },
    killPlayer: function (player, spikesLayer) {
        if (player.alive) {
            player.kill();
        }
    },
    collectKey: function (player, key) {
        if (!this.keyCollected) {
            this.keyCollected = true;
            key.alpha = 0;
            key.body.enabled = false;
            this.keyUIFull.alpha = 1; // display keyUIFull in UI
            this.audioKeyGet.play();
            this.openDoor();
        }
    },
    openDoor: function () {
        this.map.replace(167, 137, 0, 0, 50, 34, this.platformLayer);
        this.map.replace(168, 138, 0, 0, 50, 34, this.platformLayer);
    },
    closeDoor: function () {
        this.map.replace(137, 167, 0, 0, 50, 34, this.platformLayer);
        this.map.replace(138, 168, 0, 0, 50, 34, this.platformLayer);
    },
    completeLevel: function (player, doorExit) {
        if (!this.levelComplete) {
            this.levelComplete = true;
            this.audioLevelWin.play();
            player.body.enable = false;
            player.animations.stop();
            this.game.timeOverall += this.timeCurrent;
            this.lvlWinSubText.setText('Level time: ' + this.timeCurrent.toFixed(2) + ' seconds\nTotal time: ' + this.game.timeOverall.toFixed(2) + ' seconds');
            // reset text x since content has been changed
            this.lvlWinSubText.x = (this.game.world.centerX - (this.lvlWinSubText.width / 2));
            this.lvlWinText.alpha = 1;
            this.lvlWinSubText.alpha = 1;
            this.lvlWinCont.alpha = 1;
        }
    },
    loadNextLevel: function () {
        // re-enable stuff we just disabled
        this.player.body.enable = true;
        // increment level counter
        this.game.currentLevel++;
        // reset level timer
        this.timeCurrent = 0;
        // TODO: if level === 6, load end screen. otheriwse, increment
        // and load next level
        if (this.game.currentLevel <= 3) {
            this.game.state.start('game', true, false, this.player);
        }
        else { // after level 3, go to endgame state
            this.game.state.start('end');
        }
    },
    onDeath: function (player) {
        this.game.playerDeaths += 1;
        this.showDeathText(this.game.playerDeaths);
        this.resetLevel();
        this.respawnPlayer(player);
    },
    showDeathText: function (deathCount) {
        if (this.deathTextTween &&
            this.deathTextTween.isRunning) {
            this.deathTextTween.stop();
            this.deathSubTextTween.stop();
        }
        this.deathSubText.setText('You died ' + deathCount + ((deathCount === 1) ? ' time.' : ' times.'));
        this.deathSubText.x = this.game.world.centerX - (this.deathSubText.width / 2);
        this.deathText.alpha = 1;
        this.deathSubText.alpha = 1;
        this.deathTextTween = this.game.add.tween(this.deathText).to({alpha: 0}, 1000).start();
        this.deathSubTextTween = this.game.add.tween(this.deathSubText).to({alpha: 0}, 1000).start();
    },
    resetLevel: function () {
        this.closeDoor();
        this.keyUIFull.alpha = 0;
        this.keyCollected = false;
        this.levelKey.body.enabled = true;
        this.levelKey.alpha = 1;
    },
    respawnPlayer: function (player) {
        this.audioDeath.play();
        player.reset(this.playerSpawn.x, (this.playerSpawn.y - 20));
    },
    onPause: function () {
        this.pauseText.alpha = 1;
    },
    onResume: function () {
        this.pauseText.alpha = 0;
    }
};
