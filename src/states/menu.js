module.exports = {
    preload: function () {
        
    },
    create: function () {
        console.log('create: in menu state');
        game.state.start('game');
    }
};
