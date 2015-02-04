module.exports = {
    preload: function () {
        // load all game assets
        game.load.tilemap('level1', 'assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('level2', 'assets/levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('level3', 'assets/levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('Tileset', 'assets/images/spritesheet.png');
        game.load.image('background', 'assets/images/bg.png');
        game.load.image('background-castle', 'assets/images/bg_castle.png');
        game.load.image('movingplatform', 'assets/images/movingplatform.png');
        game.load.spritesheet('Player', 'assets/images/spritesheet.png', 21, 21, -1, 2, 2);
    },
    create: function () {
        console.log('create: in load state');
        game.state.start('menu');
    }
};
