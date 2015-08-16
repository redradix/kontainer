var kontainer = require('../../container');
var config = require('./config');
var webServer = require('./server');

kontainer.register('config', [], config);
kontainer.register('web', ['config'], webServer);


module.exports = kontainer;