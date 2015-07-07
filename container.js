'use strict';

/**
* Container
*
* Contains dependencies so we can configure it, pass it around
* and get services/modules from it
**/
var Container = module.exports = {

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
      moduleReg.instance = moduleReg.factory.apply(null, moduleDeps);
    }
    return moduleReg.instance;
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

  startModule: function(moduleName){
    var mod = this.modules[moduleName];
    if(!mod){
      throw new Error('Module ' + moduleName + ' is not registered');
    }
    if(mod.started){
      return;
    }
    var instance = this.getModule(moduleName);
    if(!instance){
      throw new Error('Module ' + moduleName + ' failed to be instantiated');
    }
    if(typeof(instance.start) === 'function'){
      try {
        instance.start();
      }
      catch(err){
        throw new Error('Module ' + moduleName + ' failed to start: ' + err);
      }
    }
    mod.started = true;
    return instance;
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