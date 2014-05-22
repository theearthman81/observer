"use strict";
 
describe('ObserverTest', function(){
   var observer;
   
   beforeEach(function() {
      observer = new Observer();
    });
   
   it('can be subscribed to once', function(){
       var spy = jasmine.createSpy();
       
       observer.subscribe('foo', spy);
       observer.publish('foo');
       expect(spy).toHaveBeenCalled();
   });
   
   it('can be subscribed to more than once', function(){
       var spy = jasmine.createSpy();
       var secondSpy = jasmine.createSpy();
       
       observer.subscribe('foo', spy);
       observer.subscribe('foo', secondSpy);
       observer.publish('foo');
       expect(spy).toHaveBeenCalled();
       expect(secondSpy).toHaveBeenCalled();
   });
   
   it('can be subscribed by many handlers but will stop triggering them if false is returned', function(){
       var spy = jasmine.createSpy().andReturn(false);
       var secondSpy = jasmine.createSpy();
       
       observer.subscribe('foo', spy);
       observer.subscribe('foo', secondSpy);
       observer.publish('foo');
       expect(spy).toHaveBeenCalled();
       expect(secondSpy.callCount).toBe(0);
   });
   
   it('can be subscribed to with eventName that is derived from Object.toString', function(){
       var spy = jasmine.createSpy();
       var myEvent = {
          toString: function() { return 'foo'; } 
       };
       
       observer.subscribe(myEvent, spy);
       observer.publish(myEvent);
       expect(spy).toHaveBeenCalled();
   });
   
   it('can publish an event with arguments', function(){
       var spy = jasmine.createSpy();
       
       observer.subscribe('foo', spy);
       observer.publish('foo', 'arg1', 'arg2');
       expect(spy).toHaveBeenCalledWith('arg1', 'arg2');
   });
   
   it('can unsubscribe from an event by name', function(){
       var spy = jasmine.createSpy();
       
       observer.subscribe('foo', spy);
       observer.unsubscribe('foo');
       observer.publish('foo');
       expect(spy.callCount).toBe(0);
   });
   
   it('can unsubscribe from an event by scope', function(){
       var spy = jasmine.createSpy();
       var secondSpy = jasmine.createSpy();
       
       observer.subscribe('foo', spy, 'scope');
       observer.subscribe('foo', secondSpy, 'scope');
       observer.unsubscribe(null, 'scope');
       observer.publish('foo');
       expect(spy.callCount).toBe(0);
       expect(secondSpy.callCount).toBe(0);
   });
   
   it('only runs a handler once if the once flag is set', function(){
       var spy = jasmine.createSpy();
       
       observer.subscribe('foo', spy, null, true);
       observer.publish('foo');
       observer.publish('foo');
       expect(spy).toHaveBeenCalled();
   });

   it('can observe another object', function() {
      var spy = jasmine.createSpy();

      var another = new Observer();

      observer.listenTo(another, 'foo', spy);
      another.publish('foo');
      expect(spy).toHaveBeenCalled();
   });

   it('can stop observing another object', function() {
      var spy = jasmine.createSpy();

      var another = new Observer();

      observer.listenTo(another, 'foo', spy);
      observer.stopListening();
      another.publish('foo');
      expect(spy.callCount).toBe(0);
   });

   it('can stop observing multiple objects', function() {
      var spy = jasmine.createSpy();
      var secondSpy = jasmine.createSpy();

      var another = new Observer();
      var yetAnother = new Observer();

      observer.listenTo(another, 'foo', spy);
      observer.listenTo(yetAnother, 'foo', secondSpy);
      observer.stopListening();
      another.publish('foo');
      yetAnother.publish('foo');
      expect(spy.callCount).toBe(0);
      expect(secondSpy.callCount).toBe(0);
   });
   
   it('correctly returns if it has listeners', function(){
       var spy = jasmine.createSpy();
       
       observer.subscribe('foo', spy);
       expect(observer.hasListeners('foo')).toBeTruthy();
       expect(observer.hasListeners()).toBeTruthy();
       
       observer.unsubscribe('foo');
       expect(observer.hasListeners('foo')).toBeFalsy();
       expect(observer.hasListeners()).toBeFalsy();
   });
   
   it('can correctly bubble events', function(){
       var spy = jasmine.createSpy('spy');
       var anotherSpy = jasmine.createSpy('anotherSpy');
       observer.withEventBubbling();
       
       observer.subscribe('foo', spy);
       observer.subscribe('foo:bar', anotherSpy);
       
       observer.publish('foo', 'myArg');
       expect(spy).toHaveBeenCalledWith('myArg');
       expect(anotherSpy.callCount).toBe(0);
       
       observer.publish('foo:bar', 'myArg2');
       expect(spy).toHaveBeenCalledWith('myArg2');
       expect(anotherSpy).toHaveBeenCalledWith('myArg2');
   });
   
   it('can prevent bubbling when false is returned from child event', function(){
       var spy = jasmine.createSpy('spy');
       var anotherSpy = jasmine.createSpy('anotherSpy').andReturn(false);
       observer.withEventBubbling();
       
       observer.subscribe('foo', spy);
       observer.publish('foo', 'myArg');
       expect(spy).toHaveBeenCalledWith('myArg');
       spy.reset();
       
       observer.subscribe('foo:bar', anotherSpy);
       observer.publish('foo:bar', 'myArg2');
       expect(spy.callCount).toBe(0);
       expect(anotherSpy).toHaveBeenCalledWith('myArg2');
   });
   
   it('can be used as a mixin', function(){
       var spy = jasmine.createSpy();
       var myObserver = Observer.mixin({
          foo: 'bar'
       });
       
       myObserver.subscribe('foo', spy);
       myObserver.publish('foo');
       expect(spy).toHaveBeenCalled();
   });
   
   it('can check whether a supplied object is a Observer instance or not', function(){
      [undefined, null, 0, true, {}, 'test', window, Observer].forEach(function(value) {
          expect(Observer.isObserver(value)).toBeFalsy();
      });
      
      [Observer(), new Observer()].forEach(function(value) {
          expect(Observer.isObserver(value)).toBeTruthy();
      });
   });
});
