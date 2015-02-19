module.exports = {
    create: function () {
        console.log('create: in menu state');
        this.titleText = this.game.add.bitmapText(23, 23, 'font', 'JUMP AROUND', 72);
        this.titleText.x = this.game.world.centerX - (this.titleText.width / 2);

        this.startButton = this.game.add.button(0, 300, 'start_btn', this.startGame, this);
        this.startButton.x = this.game.world.centerX - (this.startButton.width / 2);

        this.authorText = this.game.add.button(23, this.game.world.height - 23 - 18, 'author', this.openTwitter, this);
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
    openTwitter: function() {
        window.open('https://twitter.com/hollow_fish');
    }
};
