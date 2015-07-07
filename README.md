# Simple DI / IoC container

This is a really simple dependecy injection container for using in Javascript applications (both nodejs/iojs and browser environments if using CommonJS modules). No external dependencies but it uses `Array.prototype.forEach` so please polyfill as needed.

# Installation
Just grab the [container.js file](https://github.com/cdelaorden/jscontainer/blob/master/container.js). The rest of this repo is a small test suite and this README. :)

# When to use
When you want any of the following:

* Stop having lots of `require` calls at top of every file
* Stop writing relative paths like `../../../lib` and still enjoy a nice folder structure
* Being able to swap the implementation of one module without touching any of the files using it
* Being able to change/mock dependencies for testing purposes

# How it works
Ideally you will have a single file containing all your module registrations. Probably you'll have one for each environment. Then, whenever you need a module (with all its dependencies nicely inject), you will get it from the container (API below).

The container will cache all instantiated modules like standard `require` does, so dependencies all parsed only once and every subsequent use of a register module will return the same instance.

# Example

```javascript
//config.js
//A module with no deps, in this case a plain JS object
module.exports = {
  number: 3000,
  text: 'Hello world'
};

//moduleA.js
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

//moduleB.js
//A module that uses moduleB
module.exports = function(moduleA){
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

* `container.registerModule(name, [depName, depName, ...], implementation)` - Registers a module in the container. *Alias: `register`*
  * `name`- the name of the module, will be used as dependency name in other modules, and for getting/starting/stopping it.
  * `[depName, depName,...]`- this modules dependencies (their names) or an empty Array
  * `implementation` - this module implementation. If the module has dependencies, this **must be a function** accepting the dependencies in the same order. The container will throw an Error if the number of declared dependencies doesn't match the factory function arity. If the module has no dependencies, it can be a plain Object.

## Obtaining modules
* `container.getModule(name)` - Retrieves the given module from the container, with all its dependencies injected, if any. *Alias: `get`*
* `container.startModule(name)`- Retrieves the given module from the container, automatically calling the module's `start` function if it exists.

## Stopping modules
* `container.stopModule(name)` - Stops the module `name`. It will delete the current saved instance, and call the module's `stop` function if it exists. 

## Other methods
* `container.clearModule(name)`- Removes a module from the container. Will throw if the module has already been instantiated.
* `container.startAll()` - Like calling `container.start` for every registered module. Returns nothing.
* `container.stopAll()`- Like calling `container.stop` for every registered module. Returns nothing.
* `container.reset()` - Resets the container configuration. **Useful for tests**
* `container.debug()` - Prints out the container current configuration, using `console.log`.

