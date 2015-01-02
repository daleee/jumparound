module.exports = {
    init: function () {
        //Add here your scaling options
    },

    preload: function () {
        //Load just the essential files for the loading screen,
        //they will be used in the Load State
    },

    create: function () {
        console.log('create: in boot state');
        game.state.start('load');
    }
};
