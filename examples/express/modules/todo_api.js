var TodoApiFactory = function(express, todoService){

  var app = express.app;

  function getAllTodos(req, res){
    todoService.getTodos().then(function(todos){
      res.status(200).send(todos);
    });
  }

  function getTodo(req, res){
    if(!_checkParams(req, res)) {
      return res.end();
    }
    todoService.getTodo(req.params.id).then(function(todo){
      res.status(200).send(todo);
    })
    .catch(function(err){
      console.error('TodoAPI getTodo not found with id', req.params.id);
      res.status(404).end();
    });

  }

  function createTodo(req, res){
    var newTodo = {
      text: req.body.text,
      completed: req.body.completed
    };
    todoService.createTodo(newTodo)
    .then(function(todo){
      res.status(200).send(todo);
    })
    .catch(function(err){
      console.error('TodoAPI - createTodo failed', err);
      res.status(400).end();
    });
  }

  function updateTodo(req, res){
    if(!_checkParams(req, res)) {
      return res.end();
    }
    todoService.updateTodo({
      id: req.body.id,
      text: req.body.text,
      completed: req.body.completed
    })
    .then(function(todo){
      res.status(200).send(todo);
    })
    .catch(function(err){
      console.error('TodoAPI - update failed', err);
      if(err.match(/Not found/)){
        res.status(404).end();
      }
      else {
        res.status(400).end();
      }
    })
  }

  function deleteTodo(req, res){
    if(!_checkParams(req, res)) {
      return res.end();
    }

    todoService.deleteTodo(req.params.id)
    .then(function(affectedRows){
      res.status(200);
      res.end();
    })
    .catch(function(err){
      console.error('TodoApi - Delete failed for id ' + req.params.id, err);
      //hide error to the outside
      res.status(404);
      res.end();
    });

  }

  function _checkParams(req,res){
    var todoId = parseInt(req.params.id);
    if(!todoId){
      res.status(404).end();
      return false;
    }
    else {
      req.params.id = todoId;
      return true;
    }
  }

  //wire Express route
  app.get('/todos', getAllTodos);
  app.get('/todos/:id', getTodo);
  app.post('/todos', createTodo);
  app.put('/todos/:id', updateTodo);
  app.delete('/todos/:id', deleteTodo);

  //return methods for easy testing
  return {
    getAllTodos: getAllTodos,
    getTodo: getTodo,
    createTodo: createTodo,
    updateTodo: updateTodo,
    deleteTodo: deleteTodo
  }

}

module.exports = TodoApiFactory;