var bootState = function () {};

bootState.prototype.init = function () {
    
};

bootState.prototype.preload = function () {
    
};

bootState.prototype.create = function () {
    console.log('BOOT: In boot state.');
    game.state.start('load');
};

module.exports = bootState;
