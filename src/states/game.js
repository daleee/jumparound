module.exports = {
    preload: function () {
        game.load.tilemap('map', '../../assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('Tileset', '../../assets/images/spritesheet.png');
        // spritesheet(key to use, url, tile width, tile height, ???, sheet margin, tile padding)
        game.load.spritesheet('Player', '../../assets/images/spritesheet.png', 21, 21, -1, 2, 2);
    },
    create: function () {
        console.log('create: in game state');

        game.stage.backgroundColor = '#6380A1';

        // add tilemap & associated tilesets
        map = game.add.tilemap('map');
        map.addTilesetImage('Tileset');
        map.setCollisionBetween(1, 1000);
        platformLayer = map.createLayer('Platforms');
        platformLayer.resizeWorld();

        // create player & define player animations
        var playerSpawn = map.objects.Triggers[0];
        player = game.add.sprite(playerSpawn.x, playerSpawn.y, 'Player');
        player.animations.add('idle', [19], 10);
        player.animations.add('left', [26, 27, 28, 29], 10);
        player.animations.play('idle');

        // initialize world physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(player);
        game.physics.arcade.gravity.y = 250;
        player.body.collideWorldBounds = true;
    },
    update: function () {
        game.physics.arcade.collide(player, platformLayer);
    }
};
