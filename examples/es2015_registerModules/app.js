// Run this example in a recent version of Node.js (e.g 5.5.0)
'use strict';

const container = require('../../container');


class Engine {
  goes() {
    return 'Wrooom!!!';
  }
}

class Car {
  constructor(engine) {
    this.engine = engine;
  }
}


container.registerModules({
	'engine': { impl: Engine },
	'car': { deps: ['engine'], impl: Car },
});

const car = container.get('car');

console.log('The car has an ', car.engine);
console.log('If it\'s not a Tesla, then the engine goes', car.engine.goes());

//export the configured DI container
module.exports = container;