// DI container configuration file

var container = require('kontainer-di'),
    dbConfig = require('./config/database'),
    serverConfig = require('./config/server');

var databaseFactory = require('./services/database'),
    todoServiceFactory = require('./services/todo_service');

var serverFactory = require('./modules/server'),
    todoApiFactory = require('./modules/todo_api');


container.registerModules({
	'dbConfig': { impl: dbConfig },
	'serverConfig': { impl: serverConfig },

	'database': { deps: ['dbConfig'], impl: databaseFactory },
	'todoService': { deps: ['database'], impl: todoServiceFactory },

	'server': { deps: ['serverConfig'], impl: serverFactory },
	'todoApi': { deps: ['server', 'todoService'], impl: todoApiFactory },
});


module.exports = container;