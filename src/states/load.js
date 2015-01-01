var loadState = function () {};

loadState.prototype.preload = function () {
};

loadState.prototype.create = function () {
    console.log('LOAD: In load state.');
    game.state.start('menu');
};

module.exports = loadState;
