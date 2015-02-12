var Player = require('../sprites/player.js');
var MovingPlatform = require('../sprites/movingplatform.js');

module.exports = {
    // state variables
    map: null,
    player: null,
    platformLayer: null,
    playerSpawn: null,
    levelKey: null,
    levelComplete: false,
    timeCurrent: 0,
    timeLevelStart: 0,
    
    timerText: null,
    pauseText: null, 
    deathSubText: null,
    deathText: null,
    keyText: null,
    lvlWinText: null,
    lvlWinSubText: null,

    deathTextTween: null,
    deathSubTextTween: null,

    keyUIEmpty: null,
    keyUIFull: null,
    // state methods
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
        // set collisions with certain tiles (immovable world tiles)
        // all tile IDs in the spritesheet are offset by +1 here
        // exit sign, door closed #1, door closed #2, door open #1, door open #2, various spikes
        this.map.setCollisionByExclusion([254, 167, 168, 137, 138, 572, 573, 574, 575, 576]);

        // create the physical world
        this.platformLayer = this.map.createLayer('Platforms');
        this.platformLayer.resizeWorld();
        // define some tiles to have certain actions on collision
        this.map.setTileIndexCallback(137, this.completeLevel, this);

        // create some UI elements
        this.timerText = this.game.add.text(58,
                                            32,
                                            'Time: --:--',
                                            { font: "20px Arial",
                                              fill: '#000',
                                              keys: null,
                                              align: 'left'});
        this.pauseText = this.game.add.text(0,
                                            this.game.world.centerY,
                                            'PAUSED',
                                            { font: "65px Arial",
                                              fill: '#000',
                                              align: 'center'});
        this.pauseText.x = this.game.world.centerX - (this.pauseText.width / 2);
        this.pauseText.alpha = 0;
        this.deathText = this.game.add.text(0,
                                            this.game.world.centerY - 65,
                                            'DIED',
                                            { font: "65px Arial",
                                              fill: '#000',
                                              keys: null,
                                              align: 'center'});
        this.deathText.alpha = 0;
        this.deathText.x = this.game.world.centerX - (this.deathText.width / 2);
        this.deathSubText = this.game.add.text(0,
                                               this.game.world.centerY + 10,
                                               'You died X times.',
                                               { font: "20px Arial",
                                                 fill: '#000',
                                                 align: 'center'});
        this.deathSubText.alpha = 0;
        this.lvlWinText = this.game.add.text(0,
                                             this.game.world.centerY / 2,
                                             'LEVEL COMPLETE!',
                                             { font: "65px Arial",
                                               fill: '#000',
                                               align: 'center'});
        this.lvlWinSubText = this.game.add.text(0,
                                                this.game.world.centerY,
                                                'placeholder',
                                                { font: "45px Arial",
                                                  fill: '#000',
                                                  align: 'left'});
        
        this.lvlWinText.x = (this.game.world.centerX - (this.lvlWinText.width / 2));
        this.lvlWinText.alpha = 0;
        this.lvlWinSubText.alpha = 0;
        this.lvlWinText.addColor('red', 6);
        this.lvlWinText.addColor('orange', 7);
        this.lvlWinText.addColor('yellow', 8);
        this.lvlWinText.addColor('green', 9);
        this.lvlWinText.addColor('blue', 10);
        this.lvlWinText.addColor('indigo', 11);
        this.lvlWinText.addColor('violet', 12);
        this.lvlWinText.addColor('red', 13);


        this.keyUIEmpty = this.game.add.image(32, 33, 'Player', 407);
        this.keyUIFull = this.game.add.image(32, 33, 'Player', 403);
        this.keyUIFull.alpha = 0; // hide this image at first

        // initialize world physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 300;
        // the following line populates game.time.fps variables
        this.game.time.advancedTiming = true; // TODO: put behind debug flag

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
        // spikes from tiles
        this.topSpikesGroup = this.game.add.group();
        this.topSpikesGroup.enableBody = true;
        this.topSpikesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.bottomSpikesGroup = this.game.add.group();
        this.bottomSpikesGroup.enableBody = true;
        this.bottomSpikesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.map.createFromTiles([571, 572, 573], null, 'Player', undefined, this.topSpikesGroup, { alpha: 0 });
        this.map.createFromTiles([574, 575, 576], null, 'Player', undefined, this.bottomSpikesGroup, { alpha: 0 });
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

        // initialize events handlers
        this.game.onPause.add(this.onPause, this);
        this.game.onResume.add(this.onResume, this);
        // initialize timer
        this.timeLevelStart = this.game.time.now;
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
        this.game.debug.text('fps: ' + this.game.time.fps || '--', 1200, 24);
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
        key.alpha = 0;
        key.body.enabled = false;
        this.keyUIFull.alpha = 1; // display keyUIFull in UI
        this.openDoor();
    },
    openDoor: function () {
        this.map.replace(167, 137, 0, 0, 50, 34);
        this.map.replace(168, 138, 0, 0, 50, 34);
    },
    closeDoor: function () {
        this.map.replace(137, 167, 0, 0, 50, 34);
        this.map.replace(138, 168, 0, 0, 50, 34);
    },
    completeLevel: function (player, doorExit) {
        this.game.input.enabled = false;
        player.body.enable = false;
        player.animations.stop();
        this.game.timeOverall += this.timeCurrent;
        this.lvlWinSubText.setText('Level time: ' + this.timeCurrent.toFixed(2) + ' seconds\nTotal time: ' + this.game.timeOverall.toFixed(2) + ' seconds');
        // reset text x since content has been changed
        this.lvlWinSubText.x = (this.game.world.centerX - (this.lvlWinSubText.width / 2));
        this.lvlWinText.alpha = 1;
        this.lvlWinSubText.alpha = 1;
        this.levelComplete = true;
        this.game.time.events.add(Phaser.Timer.SECOND * 3, this.loadNextLevel, this);
    },
    loadNextLevel: function () {
        // re-enable stuff we just disabled
        this.game.input.enabled = true;
        this.player.body.enable = true;
        // i have no idea why the following variable doesnt reset
        // itself upon loading the new state but it doesnt.. although
        // most other things seem to... perhaps the world is not being
        // destroyed properly. TODO: look into this.
        this.levelComplete = false;
        // increment level counter
        this.game.currentLevel++;
        // reset level timer
        this.timeCurrent = 0;
        // TODO: if level === 6, load end screen. otheriwse, increment
        // and load next level
        this.game.state.start('game', true, false, this.player);
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
        this.levelKey.body.enabled = true;
        this.levelKey.alpha = 1;
    },
    respawnPlayer: function (player) {
        player.reset(this.playerSpawn.x, (this.playerSpawn.y - 20));
    },
    onPause: function () {
        this.pauseText.alpha = 1;
    },
    onResume: function () {
        this.pauseText.alpha = 0;
    }
};
