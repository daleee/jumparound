module.exports = {
    preload: function () {
        // load all game assets
        game.load.tilemap('map', 'assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('Tileset', 'assets/images/spritesheet.png');
        game.load.image('background', 'assets/images/bg.png');
        game.load.image('movingplatform', 'assets/images/movingplatform.png');
        game.load.spritesheet('Player', 'assets/images/spritesheet.png', 21, 21, -1, 2, 2);
    },
    create: function () {
        console.log('create: in load state');
        game.state.start('menu');
    }
};
