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
});