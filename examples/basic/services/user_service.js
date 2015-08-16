/*

A fictional UserService that fetches users from a database
using an external library

*/
var UserServiceFactory = function(database){
  return {
    getUsers: function(){
      return database.fetch('Users');
    }
  }
}

module.exports = UserServiceFactory;