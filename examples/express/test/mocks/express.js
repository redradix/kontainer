// Mock for modules/server.js


var mockExpress = {
  get: function(){},
  post: function(){},
  put: function(){},
  delete: function(){}
}

var mockServerFactory = function(config){
  return {
    start: function(){},
    stop: function(){},
    app: mockExpress
  };
};

module.exports = mockServerFactory;