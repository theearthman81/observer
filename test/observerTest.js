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
   
   it('correctly returns if it has listeners', function(){
       var spy = jasmine.createSpy();
       
       observer.subscribe('foo', spy);
       expect(observer.hasListeners('foo')).toBeTruthy();
       expect(observer.hasListeners()).toBeTruthy();
       
       observer.unsubscribe('foo');
       expect(observer.hasListeners('foo')).toBeFalsy();
       expect(observer.hasListeners()).toBeFalsy();
   });
   
   it('be used as a mixin', function(){
       var spy = jasmine.createSpy();
       var myObserver = Observer.mixin({
          foo: 'bar'
       });
       
       myObserver.subscribe('foo', spy);
       myObserver.publish('foo');
       expect(spy).toHaveBeenCalled();
   });
});