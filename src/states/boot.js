module.exports = {
    init: function () {
        //Add here your scaling options
    },

    preload: function () {
        //Load just the essential files for the loading screen,
        //they will be used in the Load State
        game.load.image('loadingbar', 'assets/images/loadingbar.png');
    },

    create: function () {
        console.log('create: in boot state');

        // set initial level to be 1, as this game will always start
        // from the beginning...
        game.currentLevel = 1;
        game.timeOverall = 0;
        game.state.start('load');
    }
};
