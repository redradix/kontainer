'use strict';
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser');
    //Promise = require('Q');

var ServerFactory = function(config){

  var app = express(),
      server = http.createServer(app);

  app.use(bodyParser.json());

  function start(){
    var p = Promise.defer();

    server.listen(config.port, config.url, function(err){
      if(err){
        p.reject(err);
      }
      else {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Express is listening on', host + ':' + port);
        p.resolve();
      }
    });

    return p.promise;
  }

  function stop(){
    server.close();
  }

  return {
    start: start,
    stop: stop,
    app: app,
    server: server
  }

}

module.exports = ServerFactory;