var container = require('kontainer-di'),
    knexMock = require('../mocks/knex'),
    expressMock = require('../mocks/express');

var todoServiceFactory = require('../../services/todo_service');
var todoApiFactory = require('../../modules/todo_api');

var mockServerConfig = {};
var mockDbConfig = {};

function configure(){
  container.reset();
  //mock configuration
  container.register('dbConfig', [], mockDbConfig);
  container.register('serverConfig', [], mockServerConfig);

  //mock infrastructure
  container.register('database', ['dbConfig'], knexMock);
  container.register('server', ['serverConfig'], expressMock);

  //real services for unit testing - may be swapped for mocks in individual tests
  //see tests/unit/todo_api.js
  container.register('todoService', ['database'], todoServiceFactory);
  container.register('todoApi', ['server', 'todoService'], todoApiFactory);


  return container;
};

module.exports = {
  configure: configure
}