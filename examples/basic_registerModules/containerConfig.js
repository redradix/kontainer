var kontainer = require('../../container');

var config = require('./config'),
    databaseFactory = require('./lib/database'),
    userServiceFactory = require('./services/user_service');


kontainer.registerModules({
	'config': { impl: config},
	'database': { deps: ['config'], impl: databaseFactory },
	'userService': { deps: ['database'], impl: userServiceFactory },
});

//export the configured DI container
module.exports = kontainer;