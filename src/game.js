window.game = new Phaser.Game(1920, 1080, Phaser.AUTO);

game.state.add('boot', require('./states/boot.js') );
game.state.add('load', require('./states/load.js') );
game.state.add('menu', require('./states/menu.js') );
game.state.start('boot');
