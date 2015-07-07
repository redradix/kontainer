# Simple DI / IoC container

This is a really simple dependecy injection container for using in Javascript applications (both nodejs/iojs and browser environments). No external dependencies but it uses `Array.prototype.forEach` so please polyfill as needed.

# Example

```javascript
//config.js
//A module with no deps, in this case a plain JS object
module.exports = {
  number: 3000,
  text: 'Hello world'
};

//moduleB.js
//A module that needs the config defined in the previous module
module.exports = function(config){
  return {
    getText(): function(){
      if(config.number > 1000){
        return config.text;
      }
      else {
        return 'My own text';
      }
    }
  };
}

//moduleC.js
//A module that uses moduleB
module.exports = function(moduleB){
  return {
    start: function(){
      console.log('module C started', moduleB.getText());
    },
    printText: function(){
      console.log(moduleB.getText());
    }
  }
}

//main.js
var container = require('./container');

//configure container - order is not important
container.register('config', [], require('./config'));
container.register('moduleA', ['config'], require('./moduleA'));
container.register('moduleB', ['moduleA'], require('./moduleB'));

//then use your moduleB, ideally not in the same file :)
var module = container.start('moduleB');
module.printText()

/*Console output will be, because of moduleB start() method:
moduleC started Hello world
Hello world
*/
```

# API

This container works in a very simple way: you **register** modules/services with dependencies, and then can retrieve/start/stop each of them, or all at once.

## Registering modules

* `container.registerModule(name, [depName, depName, ...], implementation)` - Registers a module in the container. *alias: `register`*
  * `name`- the name of the module, will be used as depedency name in other modules, and for getting/starting/stopping it.
  * `[depName, depName,...]`- this modules dependencies (their names) or an empty Array
  * `implementation` - this module implementation. If the module has dependencies, this **must be a function** accepting the dependencies in the same order. The container will throw an Error if the number of declared dependencies don't match the factory function arity. If the module has no dependencies, it can be a plain Object.

## Obtaining modules
* `container.getModule(name)` - Retrieves the given module from the container, with all its dependencies injected, if any. *alias: `get`*
* `container.startModule(name)`- Retrieves the given module from the container, automatically calling the module's `start` function if it exists.

## Stopping modules
* `container.stopModule(name)` - Stops the module `name`. It will delete the current saved instance, and call the module's `stop` function if it exists. 

## Start / stop hooks
If a module definition has a `start` function, it will be called (with no arguments) when the module is first instantiated because of a `startModule` or `startAll` call.

If a module definition has a `stop` function, it will be called once when the module is stopped via `stopModule`or `stopAll`.
## Other methods
* `container.clearModule(name)`- Removes a module from the container. Will throw if the module has already been instantiated.
* `container.startAll()` - Like calling `container.start` for every registered module. Returns nothing.
* `container.stopAll()`- Like calling `container.stop` for every registered module. Returns nothing.
* `container.reset()` - Resets the container configuration. **Useful for tests**
* `container.debug()` - Prints out the container current configuration, using `console.log`.

