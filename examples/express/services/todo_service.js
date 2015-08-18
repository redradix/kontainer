'use strict';
var TodoServiceFactory = function(database){
  return {
    // Return all todos in the database
    getTodos: function(){
      return database('Todo').select().orderBy('createdAt', 'desc');
    },

    // Return a single todo by Id
    getTodo: function(id){
      var p = Promise.defer();

      database('Todo').where('id', id).select()
      .then(function(rows){
        if(rows.length === 0){
          //not found
          p.reject('TodoService: not found');
        }
        else {
          p.resolve(rows[0]);
        }
      });

      return p.promise;
    },

    //Update a todo in the database
    updateTodo: function(todo){
      var p = Promise.defer();

      //TODO: real-world validation

      database('Todo').update({
        text: todo.text,
        completed: todo.completed
      })
      .where('id', todo.id)
      .then(function(affectedRows){
        if(affectedRows === 1){
          p.resolve(todo);
        }
        else {
          p.reject('Not found');
        }
      });

      return p.promise;
    },

    //Create a new todo in the database
    createTodo: function(todo){
      var p = Promise.defer();

      //TODO: real-world validation

      database('Todo').insert(todo)
      .then(function(idArray){
        //return the newly created todo
        todo.id = idArray[0];
        p.resolve(todo);
      })
      .catch(function(err){
        p.reject('TodoService: create failed. Error:' + err.toString());
      });

      return p.promise;
    },

    //Delete a todo specified by Id
    deleteTodo: function(todoId){
      var p = Promise.defer();

      database('Todo').where('id', todoId).del()
      .then(function(affectedRows){
        if(affectedRows === 1){
          return p.resolve(true);
        }
        else {
          return p.reject('TodoService: not found');
        }
      })
      .catch(function(err){
        p.reject('TodoService: delete failed. Error' + err.toString());
      });

      return p.promise;
    }
  }
}

module.exports = TodoServiceFactory;