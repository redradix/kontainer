var kontainer = require('./containerConfig');


var webApp;

kontainer.startModule('web', { async: true }).then(function(webApp){
  console.log('Web app started on ', webApp.port);
});