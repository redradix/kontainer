[![npm version](https://badge.fury.io/js/kontainer.svg)](http://badge.fury.io/js/kontainer)
[![Build Status](https://travis-ci.org/redradix/kontainer.svg?branch=master)](https://travis-ci.org/redradix/kontainer)
[![Redradix badge](http://static.redradix.com/redradix-badge.svg)](https://redradix.com/)

# Simple DI / IoC container

This is a really simple dependency injection container for Javascript applications (both nodejs/iojs and browser environments if using CommonJS modules). It uses `Array.prototype.forEach` so please polyfill as needed on your environment.

We wrote a blog post presenting this library and the motivations behind it:

[How to structure node.js applications with dependency injection](http://blog.redradix.com/an-architecture-for-complex-node-js-apps-with-dependency-injection/)

# Installation
From npm:
`npm install kontainer-di`

# When to use
When you want any of the following:

* Stop having lots of `require` calls at top of every file
* Stop writing relative paths like `../../../lib` and still enjoy a nice folder structure
* Being able to swap the implementation of one module without touching any of the files using it
* Being able to mock dependencies for testing purposes in an easy way

# How it works
Ideally you will have a single file containing all your module registrations. Probably you'll have one for each environment. Then, whenever you need a module (with all its dependencies nicely injected for you), you will get it from the container (API below).

The container will cache all instantiated modules like standard `require` does, so dependencies all parsed only once and every subsequent use of a register module will return the same instance.

# Example
See the [`examples`](https://github.com/redradix/kontainer/tree/master/examples) folder for a basic example in ES5, ES2015, an async one and a full Express application using the container.

# API

This container works in a very simple way: you **register** modules/services with dependencies, and then can retrieve/start/stop each of them, or all at once.

## Registering modules

* `container.registerModule(name, [depName, depName, ...], implementation)` - Registers a module in the container. *Alias: `register`*
  * `name`- the name of the module, will be used as dependency name in other modules, and for getting/starting/stopping it.
  * `[depName, depName,...]`- this modules dependencies (their names) or an empty Array
  * `implementation` - this module implementation. If the module has dependencies, this **must be a function** accepting the dependencies in the same order. The container will throw an Error if the number of declared dependencies doesn't match the factory function arity. If the module has no dependencies, it can be a plain Object.

## Obtaining modules
* `container.getModule(name)` - Retrieves the given module from the container, with all its dependencies injected, if any. *Alias: `get`*
* `container.startModule(name[, options])`- Retrieves the given module from the container, automatically calling the module's `start` function if it exists. If your module needs to do some async stuff, make this function return a Promise (a *thenable* to be specific) and pass in `{async: true}` in options.

## Stopping modules
* `container.stopModule(name)` - Stops the module `name`. It will delete the current saved instance, and call the module's `stop` function if it exists. 

## Other methods
* `container.clearModule(name)`- Removes a module from the container. Will throw if the module has already been instantiated.
* `container.startAll()` - Like calling `container.start` for every registered module. Returns nothing.
* `container.stopAll()`- Like calling `container.stop` for every registered module. Returns nothing.
* `container.reset()` - Resets the container configuration. **Useful for tests**
* `container.debug()` - Prints out the container current configuration, using `console.log`.

