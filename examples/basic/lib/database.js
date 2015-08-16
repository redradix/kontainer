'use strict';
/*

A fictional database access library to needs its DB configuration
*/
var DatabaseFactory = function(config){

  return {
    init: function(){
      console.log('Connected to ', config.server);
    },
    fetch: function(){
      console.log('Fetching stuff');
      return [
        {id: 1, name: 'Batman'},
        {id: 2, name: 'Galactus'},
        {id: 3, name: 'Juggernaut'}
      ]
    }
  }
};

module.exports = DatabaseFactory;