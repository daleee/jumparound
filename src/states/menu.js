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

        this.player = new Player(this.game, 175, 355);
        this.leftPlat = this.game.add.sprite(80, 400, 'menu_platform');
        this.rightPlat = this.game.add.sprite(808, 400, 'menu_platform');
        this.leftPlat.width = 168;
        this.rightPlat.width = 168;
        this.player.body.enable = false;
        this.player.height = 95;
        this.player.width = 95;
        this.player.animations.play('left');

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
