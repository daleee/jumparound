(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var game = new Phaser.Game(1050, 714, Phaser.AUTO);

game.state.add('boot', require('./states/boot.js') );
game.state.add('load', require('./states/load.js') );
game.state.add('menu', require('./states/menu.js') );
game.state.add('game', require('./states/game.js') );
game.state.add('end', require('./states/end.js') );
game.state.start('boot');

},{"./states/boot.js":4,"./states/end.js":5,"./states/game.js":6,"./states/load.js":7,"./states/menu.js":8}],2:[function(require,module,exports){
var MovingPlatform = function (game, startingX, startingY, direction, speed, distance) {
    Phaser.Sprite.call(this, game, startingX, startingY, 'movingplatform');

    // physics properties
    game.physics.enable(this);
    this.body.allowGravity = false;
    this.body.immovable = true;

    // initialize class variables
    this.smoothed = false;
    this.startingX = startingX;
    this.startingY = startingY;
    this.direction = direction;
    this.speed = speed || 150;
    this.distance = distance;
    this.destination = { x: 0, y: 0 };

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
    if (this.direction === 'down') {
        if (this.body.y < this.destination.y) {
            this.body.velocity.y = this.speed;
        }
        else {
            this.destination.y -= this.distance;
            this.direction = 'up';
        }
    }
    else if (this.direction === 'up') {
        if (this.body.y > this.destination.y) {
            this.body.velocity.y = -this.speed;
        }
        else {
            this.destination.y += this.distance;
            this.direction = 'down';
        }
    }
    else if (this.direction === 'right') {
        if (this.body.x < this.destination.x) {
            this.body.velocity.x = this.speed;
        }
        else {
            this.destination.x -= this.distance;
            this.direction = 'left';
        }
    }
    else if (this.direction === 'left') {
        if (this.body.x > this.destination.x) {
            this.body.velocity.x = -this.speed;
        }
        else {
            this.destination.x += this.distance;
            this.direction = 'right';
        }
    }
};

module.exports = MovingPlatform;

},{}],3:[function(require,module,exports){
// Player must be created after physics system is initialized
var Player = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'Player');
    // initialize class variables
    this.deaths = 0;
    this.facing = 'right';
    this.smoothed = false;
    this.groundSpeed = 150;
    this.maxVelocity = 500;
    this.speedMultiplier = 2;
    this.speedEnabled = false;
    this.autoJumpEnabled = false;

    // set animations
    this.animations.add('idle', [19], 10, false);
    this.animations.add('left', [26, 27, 28, 29], 10, true);
    this.animations.play('idle');

    // physics properties
    this.game.physics.enable(this);
    this.anchor.setTo(0.5, 0.5);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 1250;
    this.body.maxVelocity.y = this.maxVelocity;
    this.body.setSize(12, 20, 0, 1); // set bounding box to be 12x20, starting at (0,1)

    // initialize input (keybpard)
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.jumpKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
    this.speedKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.autoJumpToggleKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
    // callbacks for input that isn't necessary for movement
    // the 'onDown' signal is only triggered once per key down
    // TODO: put this behind a dev flag
    this.autoJumpToggleKey.onDown.add(function (key) {
        this.autoJumpEnabled = !this.autoJumpEnabled;
    }, this);
    this.pauseKey.onDown.add(function (key) {
        if (this.game.paused) {
            this.game.paused = false;
        }
        else {
            this.game.paused = true;
        }
    }, this);


    // add sprite to game stage/world
    this.game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    // reset player movement
    this.body.velocity.x = 0;

    // move left/right
    if (this.leftKey.isDown) {
        this.body.velocity.x = -this.groundSpeed;

        if (this.facing != 'left') {
            this.animations.play('left');
            this.scale.x *= -1;
            this.facing = 'left';
        }
    }
    else if (this.rightKey.isDown) {
        this.body.velocity.x = this.groundSpeed;
        
        if (this.facing != 'right') {
            if (this.facing === 'left') {
                this.scale.x *= -1;
            }
            this.animations.play('left');
            this.facing = 'right';
        }
    }
    // go idle
    else {
        if (this.facing != 'idle') {
            if (this.facing === 'left') {
                this.scale.x *= -1;
            }
            this.animations.play('idle');
            this.facing = 'idle';
        }
    }

    // use speed key to run!
    if (this.speedKey.isDown) {
        this.speedEnabled = true;
        this.body.velocity.x *= this.speedMultiplier;
    }
    else {
        if (this.speedEnabled) {
            this.speedEnabled = false;
        }
    }

    // jumping
    if (this.jumpKey.isDown && this.body.onFloor() ||
        this.autoJumpEnabled && this.body.onFloor()) {
        /// number achieved via playtesting
        this.body.velocity.y = -this.body.maxVelocity.y;
    }
};

Player.prototype.destroy = function () {};

module.exports = Player;

},{}],4:[function(require,module,exports){
module.exports = {
    init: function () {
        //Add here your scaling options
    },

    preload: function () {
        //Load just the essential files for the loading screen,
        //they will be used in the Load State
        this.game.load.image('loadingbar', 'assets/images/loadingbar.png');

        // game settings
        this.game.antialias = false;
    },

    create: function () {
        console.log('create: in boot state');

        // set initial level to be 1, as this game will always start
        // from the beginning...
        this.game.currentLevel = 1;
        this.game.timeOverall = 0;
        this.game.playerDeaths = 0;
        this.game.state.start('load');
    }
};

},{}],5:[function(require,module,exports){
module.exports = {
    create: function () {
        console.log('create: in end state');
        var endGameText = 'CONGRATULATIONS!\n' +
                'ALL OF THAT JUMPING\n' +
                'AROUND HAS HELPED YOU GET HOME.\n' +
                'YOUR JOURNEY IS NOW OVER.\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '...NO REALLY, IT\'S OVER.\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                '\n' +
                'THIS ISN\'T SOME MARVEL MOVIE\nWITH 3 STINGERS,' +
                'YOU CAN\nCLOSE THE BROWSER NOW IF YOU \nWANT OR HIT "C" TO RETURN TO \nTHE MENU.\n';

        this.endTextObj = this.game.add.bitmapText(20, this.game.world.height, 'font', endGameText, 32);
        this.endTextTween = this.game.add.tween(this.endTextObj).to({y: -1000}, 40000, Phaser.Easing.Linear.None, true);
    },
    update: function() {
        if ( this.game.input.keyboard.isDown(Phaser.Keyboard.C) ) {
            this.game.state.start('menu');
        }
        
    }

};

},{}],6:[function(require,module,exports){
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

},{"../sprites/movingplatform.js":2,"../sprites/player.js":3}],7:[function(require,module,exports){
module.exports = {
    preload: function () {
        // create preload bar
        this.preloadBar = this.add.sprite(300, 400, 'loadingbar');
        this.preloadBar.x = this.world.centerX - (this.preloadBar.width / 2);
        this.game.load.setPreloadSprite(this.preloadBar);
        // load all game assets
        this.game.load.tilemap('level1', 'assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('level2', 'assets/levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('level3', 'assets/levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('Tileset', 'assets/images/spritesheet.png');
        this.game.load.image('background', 'assets/images/bg.png');
        this.game.load.image('background-castle', 'assets/images/bg_castle.png');
        this.game.load.image('movingplatform', 'assets/images/movingplatform.png');
        this.game.load.image('start_btn', 'assets/images/start_btn.png');
        this.game.load.image('arrow', 'assets/images/arrow.png');
        this.game.load.image('author', 'assets/images/author.png');
        this.game.load.image('menu_platform', 'assets/images/menu_platform.png');
        this.game.load.image('menu_door', 'assets/images/menu_door.png');
        this.game.load.spritesheet('Player', 'assets/images/spritesheet.png', 21, 21, -1, 2, 2);
        this.game.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.fnt');

        this.game.load.audio('a_Death', 'assets/audio/death.ogg');
        this.game.load.audio('a_KeyGet', 'assets/audio/keyget.ogg');
        this.game.load.audio('a_LevelWin', 'assets/audio/levelwin.ogg');
    },
    create: function () {
        console.log('create: in load state');
        this.game.state.start('menu');
    }
};

},{}],8:[function(require,module,exports){
var Player = require('../sprites/player.js');

module.exports = {
    create: function () {
        console.log('create: in menu state');
        this.titleText = this.game.add.bitmapText(23, 23, 'font', 'JUMP AROUND', 72);
        this.titleText.x = this.game.world.centerX - (this.titleText.width / 2);

        this.startText = this.game.add.text(0, 120, "PRESS SPACEBAR TO BEGIN", {
            font: '35px Arial',
            fill: '#000',
            stroke: '#fff',
            strokeThickness: 3,
            align: 'center'
        } );
        this.startText.x = this.game.world.centerX - (this.startText.width / 2);

        var controls = 'how to play:\n' +
                'arrows keys: move left & right\n' +
                'z (hold): run\n' +
                'spacebar: jump\n' +
                'p: toggle pause';
        this.howToPlayText = this.game.add.text(0, 450, controls, {
            font: '30px Arial',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 1,
            align: 'center'
        });
        this.howToPlayText.x = this.game.world.centerX - (this.howToPlayText.width / 2);

        this.authorText = this.game.add.button(23, this.game.world.height - 23 - 18, 'author', this.openWebpage, this);

        this.door = this.game.add.sprite(this.game.world.centerX - 20, this.game.world.centerY - 60, 'menu_door');
        this.door.width = 126;
        this.door.height = 210;
        this.door.anchor.setTo(0.5, 0.5);

        this.key = this.game.add.sprite(850, 315, 'Player', 403);
        this.key.width = 63;
        this.key.height = 63;

        this.leftPlat = this.game.add.sprite(80, 400, 'menu_platform');
        this.rightPlat = this.game.add.sprite(808, 400, 'menu_platform');
        this.leftPlat.width = 168;
        this.rightPlat.width = 168;

        this.player = new Player(this.game, 175, 355);
        this.player.body.enable = false;
        this.player.height = 95;
        this.player.width = 95;
        console.log(this.key);

        this.keyTween = this.game.add.tween(this.key).to({y: 335}, 1000, Phaser.Easing.Back.InOut, true, 0, -1, true);
        this.doorRotateTween = this.game.add.tween(this.door).to({angle: 360}, 1000, Phaser.Easing.Linear.None, true, 0, -1);
    },
    update: function() {
        if ( this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ) {
            this.startGame();
        }
    },
    startGame: function() {
        this.game.state.start('game');
    },
    moveArrowToButton: function(button) {
        // instant movement of arrow
        this.selectionArrow.x = button.x - 56 - 20;
        this.selectionArrow.y = button.y;
    },
    openWebpage: function() {
        window.open('http://dale.io');
    }
};

},{"../sprites/player.js":3}]},{},[1]);
