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
