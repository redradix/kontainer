'use strict';

var should = require('should'),
    sinon = require('sinon'),
    container = require('../container');

describe('Module Container', function(){
  var moduleA, moduleB, moduleC;

  beforeEach(function(){
    container.reset();
    //Mock module factories
    moduleA = function (){
      return {
        name: "A",
        foo: function(bar){
          return bar*2;
        },
        start: sinon.spy(),
        stop: sinon.spy()
      };
    };
    moduleB = function(anotherModule){
      var factor = 10;
      return {
        foo: function(){
          return anotherModule.foo(factor);
        },
        start: sinon.spy(),
        stop: sinon.spy()
      }
    };
    moduleC = function(modA, modB){
      //affect global state in some way
      modA.name = 'Changed A';
      return {
        foo: function(){
          return modA.foo(10) + modB.foo();
        }
      }
    };
  });

  describe('Registration', function(){
    it('Should accept module registration', function(){
      container.registerModule('A', [], moduleA);
    });

    it('Should accept either a factory or an instance', function(){
      var modFoo;
      container.registerModule('A', [], { foo: 'bar' });
      modFoo = container.getModule('A');
      modFoo.should.be.an.Object;
      modFoo.should.have.property('foo', 'bar');
    });

    it('Should reject an object module with dependencies', function(){
      container.registerModule.bind(container, 'A', ['C'], { foo: 'bar'})
        .should.throw();
    });

    it('Should throw an error if registering a duplicate module', function(){
      container.registerModule('A', [], moduleA);
      container.registerModule.bind(container, 'A', moduleA)
        .should.throw();
    });

    it('Should allow clearing a module', function(){
      container.registerModule('A', [], moduleA);
      container.clearModule('A');
      container.registerModule('A', [], moduleA);
    });

    it('Should throw an error when clearing an instantiated module', function(){
      container.registerModule('A', [], moduleA);
      container.getModule('A');
      container.clearModule.bind(container, 'A').should.throw();
    });
  });

  describe('Getting instances', function(){

    it('Should return module instances', function(){
      var modA, fooRes;
      container.registerModule('A', [], moduleA);
      modA = container.getModule('A');
      modA.should.be.an.Object;
      modA.should.have.property('name', 'A');
      modA.foo.should.be.a.Function;
      fooRes = modA.foo(1);
      fooRes.should.equal(2);
    });

    it('Should return module instances with dependencies', function(){
      var modA, modB, fooRes;
      container.registerModule('A', [], moduleA);
      container.registerModule('B', ['A'], moduleB);
      modB = container.getModule('B');
      modB.should.be.an.Object;
      modB.foo.should.be.a.Function;
      fooRes = modB.foo();
      fooRes.should.equal(20);
    });

    it('Should return module instances with nested dependencies', function(){
      var modA, modB, modC, fooRes;
      container.registerModule('A', [], moduleA);
      container.registerModule('C', ['A', 'B'], moduleC);
      container.registerModule('B', ['A'], moduleB);

      modB = container.getModule('B');
      modC = container.getModule('C');

      modB.should.be.an.Object;
      modB.foo.should.be.a.Function;
      modC.should.be.an.Object;
      modC.foo.should.be.a.Function;

      fooRes = modC.foo();
      fooRes.should.equal(40);

    });

    it('Should throw an error when asked for non-registered module', function(){
      container.getModule.bind(container, 'A')
        .should.throw();
    });

    it('Should fail if dependencies are missing', function(){
      var modC;
      container.registerModule('C', ['A', 'B'], moduleC);
      try {
        modC = container.getModule('C');
      }
      catch(err){
        err.should.be.an.Error;
        err.toString().should.match(/A not found/i);
      }
    });

  });

  describe('Starting', function(){
    it('Should allow starting a single module', function(){
      container.registerModule('A', [], moduleA);
      var modA = container.startModule('A');
      modA.start.callCount.should.equal(1);
    });

    it('Should instantiate all registered modules with startAll', function(){
      container.registerModule('A', [], moduleA);
      container.registerModule('C', ['A', 'B'], moduleC);
      container.registerModule('B', ['A'], moduleB);
      container.startAll();
      var modA = container.getModule('A');
      modA.name.should.equal('Changed A');
    });

    it('Should call module\'s start function only once if defined when starting', function(){
      var modA, modB;
      container.registerModule('A', [], moduleA);
      container.startAll();
      modA = container.getModule('A');
      modA.start.callCount.should.equal(1);
      container.startAll();
      modA.start.callCount.should.equal(1);
    });
  });

  describe('Stopping', function(){
    it('Should allow stopping a single module', function(){
      var modA;
      container.registerModule('A', [], moduleA);
      //repeat operation to test duplicate calls being made
      modA = container.getModule('A');
      container.startModule('A');
      container.stopModule('A');
      modA.start.callCount.should.equal(1);
      modA.stop.callCount.should.equal(1);
    });

    it('Should stop all modules with stopAll', function(){
      container.registerModule('A', [], moduleA);
      container.registerModule('B', ['A'], moduleB);
      container.registerModule('C', ['A', 'B'], moduleC);
      container.startAll();
      var modA = container.getModule('A');
      var modB = container.getModule('B');
      container.stopAll();

      modA.start.callCount.should.equal(1);
      modB.start.callCount.should.equal(1);
      modA.stop.callCount.should.equal(1);
      modB.stop.callCount.should.equal(1);

    });
  });

  describe('API alias', function(){
    it('Should allow using register instead of registerModule', function(){
      container.register('A', [], moduleA);
      var modA = container.getModule('A');
      modA.should.be.an.Object;
    });

    it('Should allow using get instead of getModule', function(){
      container.register('A', [], moduleA);
      container.register('B', ['A'], moduleB);
      var modB = container.get('B');
      modB.should.be.an.Object;
    });

    it('Should allow using start instead of startModule', function(){
      container.register('A', [], moduleA);
      container.register('B', ['A'], moduleB);
      var modB = container.start('B');
      modB.should.be.an.Object;
    });

    it('Should allow using stop instead of stopModule', function(){
      container.register('A', [], moduleA);
      container.register('B', ['A'], moduleB);
      var modB = container.start('B');
      modB.should.be.an.Object;
      container.stop('B');
      modB.stop.callCount.should.equal(1);
    });
  });


});//full suite end

//Mock module factories
function moduleA(){
  return {
    name: "A",
    foo: function(bar){
      return bar*2;
    },
    start: sinon.stub(),
    stop: sinon.stub()
  };
}

function moduleB(anotherModule){
  var factor = 10;
  return {
    foo: function(){
      return anotherModule.foo(factor);
    },
    start: sinon.stub(),
    stop: sinon.stub()
  }
}

function moduleC(modA, modB){
  //affect global state in some way
  modA.name = 'Changed A';
  return {
    foo: function(){
      return modA.foo(10) + modB.foo();
    }
  }
}