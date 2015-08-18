var assert = require('assert'),
    containerConfig = require('../helpers/containerConfig');

describe('Todo Service', function(){

  var subject, knex;

  var mockTodos = [
    { id: 1, text: 'foo', completed: false },
    { id: 2, text: 'bar', completed: true }
  ];

  before(function(){
    var container = containerConfig.configure();
    subject = container.get('todoService');
    knex = container.get('database');
  });

  beforeEach(function(){
    knex.clean();
  });

  it('Should be an object', function(){
    assert.equal('object', typeof(subject));
  });

  it('Should fetch all todos from database', function(done){
    //setup fake data with our mock
    knex('Todo').setup(mockTodos);
    subject.getTodos().then(function(res){
      assert(Array.isArray(res));
      assert.equal(2, res.length);
      done();
    });
  });

  it('Should fetch a single todo from database', function(done){
    knex('Todo').setup(mockTodos);
    subject.getTodo(1)
    .then(function(todo){
      assert.deepEqual(todo, mockTodos[0]);
      done();
    });
  });

  it('Should update a todo', function(done){
    var mockTodo = {
      id: 1, text: 'updated', completed: false
    };
    knex('Todo').setup(1);
    subject.updateTodo(mockTodo)
    .then(function(todo){
      assert.deepEqual(todo, mockTodo);
      done();
    });
  });

  it('Should fail when updating a todo fails', function(done){
    var mockTodo = {
      id: 3
    };
    knex('Todo').setup(0);
    subject.updateTodo(mockTodo)
    .catch(function(err){
      assert(err.match(/Not found/));
      done();
    });
  });

  it('Should create a todo and return the newly created item', function(done){
    var mockTodo = {
      text: 'Do something',
      completed: false
    };
    knex('Todo').setup([1]);
    subject.createTodo(mockTodo)
    .then(function(newTodo){
      assert.equal(newTodo.text, mockTodo.text);
      assert.equal(newTodo.completed, mockTodo.completed);
      done();
    });
  });

  it('Should fail when creating a todo fails', function(done){
    var mockTodo = { foo: 'bar' };
    knex('Todo').shouldThrow(true, new Error('Something failed'));
    subject.createTodo(mockTodo)
    .catch(function(err){
      assert(err.match(/Something failed/));
      done();
    });
  });

  it('Should delete a todo', function(done){
    knex('Todo').setup(1);
    subject.deleteTodo(25)
    .then(function(success){
      assert.equal(success, true);
      done();
    });
  });

  it('Should fail when deleting a todo affect 0 rows', function(done){
    knex('Todo').setup(0);
    subject.deleteTodo(25)
    .catch(function(err){
      assert(err.match(/not found/));
      done();
    });
  });

  it('Should fail when deleting a todo and DB fails', function(done){
    knex('Todo').shouldThrow(true, new Error('Something failed'));
    subject.deleteTodo(25)
    .catch(function(err){
      assert(err.match(/Something failed/));
      done();
    });
  });

});