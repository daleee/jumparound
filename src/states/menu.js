module.exports = {
    preload: function () {
        
    },
    create: function () {
        console.log('create: in menu state');
        this.game.state.start('game');
    }
};
