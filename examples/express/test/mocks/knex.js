'use strict';
/**
  A knex.js mock to be used in unit tests

  Note: This mock expects the user to use the Promise-based syntax of knex

  Example usage:

  //1st setup fake table data
  knex('Contact').setup([
    { id: 1, name: 'Foo'}
  ]);
  //Then query as normally
  knex('Contact')
    .where('id', 5)
    .then(function(contact){
      //contact will contain the fake object
    });

**/
var mock = {
  _data: {},
  _throw: false,
  _error: null,
  _table: 'default',
  _chain: function(){
    return this;
  },
  _activeTable: function(table){
    this._table = table || 'default';
  },
  //Allow the test to setup data returned from any query
  setup: function(data, table){
    table || (table = this._table);
    this._data[table] = data;
  },
  //Cleans setup data
  clean: function(){
    this._data = {};
    this._throw = false;
    this._error = null;
  },
  //Adds rows to existing setup data
  addRows: function(rows, table){
    table || (table = 'default');
    this._data[table].concat(rows);
  },
  //Forces next query to throw an error
  //that can be catched with .then(onSuccess,onError) or .catch()
  shouldThrow: function(bool, err){
    this._throw = bool;
    if(bool){
      this._error = err || new Error('knex error');
    }
  },
  //Fakes a Promise .then
  then: function(onFullfill, onReject){
    if(!this._throw){
      var data = this._data[this._table] || [];
      onFullfill(data);
    }
    else if(typeof(onReject) === 'function'){
      onReject(this._error);
    }
    return this;
  },
  //Fakes a Promise .catch
  catch: function(cb){
    if(this._throw){
      return cb(this._error);
    }
  }
};

//mock the chain methods of knex
var chainMethods = ['join', 'rightJoin', 'leftJoin', 'innerJoin',
  'where', 'whereIn', 'as', 'select', 'insert', 'update', 'del',
  'orderBy', 'from', 'transacting', 'transaction', 'having', 'groupBy'
];
chainMethods.forEach(function(method){
  mock[method] = mock._chain;
});

function knexFactory(config){
  function knex(tableName){
    mock._activeTable(tableName);
    return mock;
  }

  knex.transaction = function(t){
    return mock;
  };

  knex.clean = function(){
    mock.clean();
  }

  return knex;
}

module.exports = knexFactory;