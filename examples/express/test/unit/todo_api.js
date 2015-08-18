'use strict';
var assert = require('assert'),
    sinon = require('sinon'),
    containerConfig = require('../helpers/containerConfig');

describe('Todo API', function(){

  var mockTodoServiceFactory = function(database){
    return {
      getTodos: function(){
        return Promise.resolve(mockTodos);
      },
      getTodo: function(){
        return Promise.resolve(mockTodos[0]);
      },
      createTodo: function(todo){
        return Promise.resolve(todo);
      },
      updateTodo: function(todo){
        return Promise.resolve(todo);
      },
      deleteTodo: function(){
        return Promise.resolve(true);
      }
    };
  };

  var mockTodos =  [
    { id: 1, text: 'foo'},
    { id: 2, text: 'bar'}
  ];

  var mockResponse = {
    status: function(){ return this; },
    send: function() { return this; },
    end: function(){}
  };



  //shortcut to setTimeout - needed for mock object Promises to resolve
  var waitPromise = function(callback){
    return setTimeout(callback, 1);
  }

  //creates a mock request
  var createMockRequest = function(params, body){
    return {
      params: params || null,
      body: body || null,
    };
  }

  //To be used in tests
  var subject, mockTodoService, sendSpy, statusSpy;

  before(function(){
    var container = containerConfig.configure();
    //we can swap one of the container's module
    container.swapModule('todoService', ['database'], mockTodoServiceFactory);
    subject = container.getModule('todoApi');
    //for stubbing in tests
    mockTodoService = container.getModule('todoService');
    sendSpy = sinon.spy(mockResponse, 'send');
    statusSpy = sinon.spy(mockResponse, 'status');
  });

  after(function(){
    sendSpy.restore();
    statusSpy.restore();
  });

  afterEach(function(){
    sendSpy.reset();
    statusSpy.reset();
  })

  it('Should return all Todos', function(done){
    subject.getAllTodos(null, mockResponse);
    waitPromise(function(){
      assert.equal(statusSpy.callCount, 1);
      assert.equal(statusSpy.getCall(0).args[0], 200);
      assert.equal(sendSpy.callCount, 1);
      assert.deepEqual(sendSpy.getCall(0).args[0], mockTodos);
      done();
    });
  });

  it('Should return a single todo given its id', function(done){
    var req = createMockRequest({ id: 1});
    subject.getTodo(req, mockResponse);
    waitPromise(function(){
      assert.equal(statusSpy.callCount, 1);
      assert.equal(statusSpy.getCall(0).args[0], 200);
      assert.equal(sendSpy.callCount, 1);
      assert.deepEqual(sendSpy.getCall(0).args[0], mockTodos[0]);
      done();
    });
  });

  it('Should send a 404 for an invalid todo Id', function(done){
    var req = createMockRequest({id: 'abc'});
    var next = sinon.spy();
    subject.getTodo(req, mockResponse, next);
    waitPromise(function(){
      assert.equal(statusSpy.callCount, 1);
      assert.equal(statusSpy.getCall(0).args[0], 404);
      assert.equal(sendSpy.callCount, 0);
      done();
    });
  });

  it('Should create a new todo', function(done){
    var newTodo = { text: 'test', completed: false };
    var req = createMockRequest(null, newTodo);
    subject.createTodo(req, mockResponse);
    waitPromise(function(){
      assert.equal(statusSpy.callCount, 1);
      assert.equal(statusSpy.getCall(0).args[0], 200);
      assert.equal(sendSpy.callCount, 1);
      assert.deepEqual(sendSpy.getCall(0).args[0], newTodo);
      done();
    });
  });

  it('Should update an existing todo', function(done){
    var updatedTodo = { id: 1, text: 'updated', completed: true };
    var req = createMockRequest({ id: 1 }, updatedTodo);
    subject.updateTodo(req, mockResponse);
    waitPromise(function(){
      assert.equal(statusSpy.callCount, 1);
      assert.equal(statusSpy.getCall(0).args[0], 200);
      assert.equal(sendSpy.callCount, 1);
      assert.deepEqual(sendSpy.getCall(0).args[0], updatedTodo);
      done();
    });
  });

  it('Should delete a todo', function(done){
    var req = createMockRequest({ id: 1});
    subject.deleteTodo(req, mockResponse);
    waitPromise(function(){
      assert.equal(statusSpy.callCount, 1);
      assert.equal(statusSpy.getCall(0).args[0], 200);
      done();
    });
  });



});