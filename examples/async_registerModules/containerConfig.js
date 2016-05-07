var kontainer = require('../../container');
var config = require('./config');
var webServer = require('./server');


kontainer.registerModules({
	'config': { impl: config}, // when depdencies are empty "[]", it's optional
	'web': { deps: ['config'], impl: webServer }
});;


module.exports = kontainer;