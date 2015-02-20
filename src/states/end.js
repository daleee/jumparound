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
