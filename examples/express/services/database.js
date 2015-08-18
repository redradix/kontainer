'use strict';
var knex = require('knex');
var DatabaseFactory = function(dbConfig){
  return knex(dbConfig);
}

module.exports = DatabaseFactory;