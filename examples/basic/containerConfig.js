var kontainer = require('../../container');

var config = require('./config'),
    databaseFactory = require('./lib/database'),
    userServiceFactory = require('./services/user_service');



kontainer.register('config', [], config);
kontainer.register('database', ['config'], databaseFactory);
kontainer.register('userService', ['database'], userServiceFactory);

//export the configured DI container
module.exports = kontainer;