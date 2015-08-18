//database configuration for knex
module.exports = {
  /* MySQL configuration
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
  }
  */

  //SQLite configuration
  client: 'sqlite3',
  connection: {
    filename: './data/todos.sqlite3'
  }
};