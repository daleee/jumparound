module.exports = {
    preload: function () {
        
    },
    create: function () {
        console.log('create: in load state');
        game.state.start('menu');
    }
};
