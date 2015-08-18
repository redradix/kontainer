// DI container configuration file

var container = require('kontainer-di'),
    dbConfig = require('./config/database'),
    serverConfig = require('./config/server');

var databaseFactory = require('./services/database'),
    todoServiceFactory = require('./services/todo_service');

var serverFactory = require('./modules/server'),
    todoApiFactory = require('./modules/todo_api');


container.register('dbConfig', [], dbConfig);
container.register('serverConfig', [], serverConfig);

container.register('database', ['dbConfig'], databaseFactory);
container.register('todoService', ['database'], todoServiceFactory);

container.register('server', ['serverConfig'], serverFactory);
container.register('todoApi', ['server', 'todoService'], todoApiFactory);


module.exports = container;