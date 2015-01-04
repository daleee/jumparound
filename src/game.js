window.game = new Phaser.Game(1280, 720, Phaser.AUTO);

game.state.add('boot', require('./states/boot.js') );
game.state.add('load', require('./states/load.js') );
game.state.add('menu', require('./states/menu.js') );
game.state.add('game', require('./states/game.js') );
game.state.start('boot');
