module.exports = {
    init: function () {
        //Add here your scaling options
    },

    preload: function () {
        //Load just the essential files for the loading screen,
        //they will be used in the Load State
        this.game.load.image('loadingbar', 'assets/images/loadingbar.png');

        // game settings
        this.game.antialias = false;
    },

    create: function () {
        console.log('create: in boot state');

        // set initial level to be 1, as this game will always start
        // from the beginning...
        this.game.currentLevel = 1;
        this.game.timeOverall = 0;
        this.game.playerDeaths = 0;
        this.game.state.start('load');
    }
};
