'use strict';
var http = require('http');
var Promise = require('bluebird');

/**

Example of async module start. In this case this module
is starting an HTTP server which is by definition an async operation
so we return a Promise.

This module should be started with
kontainer.start('moduleName', {async: true});

**/
var ServerFactory = function(config){
  var server = http.createServer();

  function start(){
    return new Promise(function(resolve, reject){
      server.listen(config.serverPort, function(err){
        if(err){
          reject(err);
        }
        resolve();
      });
    });
  }

  return {
    start: start,
    port: config.serverPort
  };

}

module.exports = ServerFactory;