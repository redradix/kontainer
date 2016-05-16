'use strict';
var container = require('./containerConfig');


var knex, todoApi;

knex = container.get('database');
knex.migrate.latest()
.then(function(){
  console.log('SQLite database ready');
  //retrieve the TodoApi, just so it wires itself with Express
  todoApi = container.get('todoApi');
  // although the server module was already instantiated with the line above
  // its 'start' method hasn't been called yet, so we launch the http server here
  var server = container.startModule('server', { async: true })
    .then(function(server){
      console.log('Example App ready, visit the /todos url in your browser');
      console.log('Available methods');
      console.log('\tGET /todos');
      console.log('\tGET /todos/:id');
      console.log('\tPOST /todos');
      console.log('\tPUT /todos/:id');
      console.log('\tDELETE /todos/:id');
    });

});
