var kontainer = require('./containerConfig');

var userService = kontainer.get('userService');
var users = userService.getUsers();
console.log(users);

