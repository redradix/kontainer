'use strict';
var Promise = require('bluebird');

/**
* Container
*
* Contains dependencies so we can configure it, pass it around
* and get services/modules from it
**/
var Container = {

  modules: {},

  /** Registers a module. Each module should return a function
  to be called with all its dependencies in order */
  registerModule: function(moduleName, dependencies, moduleDef){
    if(this.modules[moduleName] !== undefined){
      throw new Error('Module ' + moduleName + ' is already registered. Use swapModule() instead.');
    }
    var moduleReg = {
      name: moduleName,
      deps: dependencies,
      instance: null,
      started: false
    };
    if(typeof(moduleDef) === 'function'){
      //check factory signature
      if(moduleDef.length !== dependencies.length){
        throw new Error('Module' + moduleName + ' factory function arguments don\'t match the passed dependencies');
      }
      //factory method
      moduleReg.factory = moduleDef;

    }
    else {
      //if not a factory, we can't inject deps!
      if(dependencies.length > 0){
        throw new Error('Module ' + moduleName + ' registered with dependencies without factory');
      }
      //an Object or already configured service
      moduleReg.instance = moduleDef;
    }
    this.modules[moduleName] = moduleReg;
  },

  getModule: function(moduleName){
    var moduleReg = this.modules[moduleName];
    if(moduleReg === undefined){
      throw new Error('Module ' + moduleName + ' not found');
    }
    if(!moduleReg.instance){
      var moduleDeps = this.getModuleDeps(moduleReg);

      if (this.isClass(moduleReg.factory)) {
        moduleDeps.unshift(null);
        moduleReg.instance = new (Function.prototype.bind.apply(moduleReg.factory, moduleDeps));
        moduleReg.instance.prototype = moduleReg.factory.prototype;
      } else {
        moduleReg.instance = moduleReg.factory.apply(null, moduleDeps);
      }

      if (!moduleReg.instance) {
        console.warn('Factory did not instantiate anything for "' + moduleName + '"');
      }
    }
    return moduleReg.instance;
  },

  isClass: function(func) {
    return typeof func === 'function' && /^class\s/.test(func+'');
  },

  clearModule: function(moduleName){
    var moduleReg = this.modules[moduleName];
    if(moduleReg === undefined){
      //do nothing
      return;
    }
    if(moduleReg.instance){
      throw new Error('Module ' + moduleName + ' was already instantiated');
    }
    delete this.modules[moduleName];
  },

  swapModule: function(moduleName, deps, moduleDef){
    this.clearModule(moduleName);
    this.registerModule(moduleName, deps, moduleDef);
  },

  /** Returns one module's dependencies as an Array of initialized modules **/
  getModuleDeps: function(moduleRegistry){
    var res = [],
        self = this;
    moduleRegistry.deps.forEach(function(dep){
      if(dep === moduleRegistry.name){
        throw new Error('Module ' + dep + ' can\'t depend on itself');
      }
      res.push(self.getModule(dep));
    });

    return res;
  },

  reset: function(){
    this.modules = {};
  },

  startModule: function(moduleName, options){
    var instance, startRet;
    var mod = this.modules[moduleName];
    if(!mod){
      throw new Error('Module ' + moduleName + ' is not registered');
    }
    if(mod.started){
      return mod.instance;
    }
    instance = this.getModule(moduleName);
    if(!instance){
      throw new Error('Module ' + moduleName + ' failed to be instantiated');
    }
    if(typeof(instance.start) === 'function'){
      try {
        startRet = instance.start();
      }
      catch(err){
        throw new Error('Module ' + moduleName + ' failed to start: ' + err);
      }
    }
    if(options && !!options.async){
      if(typeof(startRet.then) !== 'function'){
        throw new Error('Module ' + moduleName + ' start() method does not return a Promise');
      }

      return startRet.then(function(){
        mod.started = true;
        return instance;
      });
    }
    else {
      mod.started = true;
      return instance;
    }
  },

  stopModule: function(moduleName){
    var mod = this.modules[moduleName];
    if(!mod){ return; }
    if(!mod.instance || !mod.started) { return; }
    if(typeof(mod.instance.stop) === 'function'){
      mod.instance.stop();
    }
    mod.instance = null;
    mod.started = false;
  },

  startAll: function(){
    var moduleKeys = Object.keys(this.modules);
    moduleKeys.forEach(function(key){
      var moduleReg = this.modules[key];
      this.startModule(moduleReg.name);
    }, this);
  },

  stopAll: function(){
    var moduleKeys = Object.keys(this.modules);
    moduleKeys.forEach(function(key){
      var moduleReg = this.modules[key];
      this.stopModule(moduleReg.name);
    }, this);
  },


  debug: function(){
    console.log('** Container Modules **');
    var moduleKeys = Object.keys(this.modules);
    moduleKeys.forEach(function(key){
      var reg = this.modules[key];
      console.log(reg.name, 'instance: ', reg.instance !== undefined ? 'Yes':'No', 'factory:', reg.factory !== undefined ? 'Yes' : 'No');
    }, this);
    console.log('** Container finished **');
  }
};

//Some alias
Container.register = Container.registerModule;
Container.get = Container.getModule;
Container.start = Container.startModule;
Container.stop = Container.stopModule;

module.exports = Container;
