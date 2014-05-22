(function (root, cls) {
   if(typeof module !== 'undefined' && module.exports) {
      module.exports = cls();
   } else if (typeof define === 'function' && define.amd) {
      define(cls);
   } else {
      root.Observer = cls();
   }
}(this, function() {

   "use strict";

   /**
    * Pub/Sub library that allows 'subscribe/on', 'publish/fire' and 'unsubscribe/un' methods. 
    *
    * @class Observer
    * @constructor
    */
   function Observer() {
      if (!Observer.isObserver(this)) {
        return new Observer();
      }
   }
   
   var prototype = Observer.prototype;
   
   /**
    * @type {Object}
    */
   prototype._topics = null;

   /**
    * @type {Observer[]}
    */
   prototype._observing = null;

   /**
    * @type {Boolean}
    */
   prototype._eventsShouldBubble = false;

   /**
    * Whether events should events bubble up to parent.
    *
    * @method withEventBubbling
    * @chainable
    * @return {*} 'this' for chaining
    */
   prototype.withEventBubbling = function() {
      this._eventsShouldBubble = true;
      return this;
   };

   /**
    * Lazy getter for topics.
    * @return {Object}
    */
   prototype._getTopics = function() {
      if (!this._topics) {
         this._topics = Object.create(null);
      }
      return this._topics;
   };

   /**
    * Private method to publish an event. 
    *
    * @param {String} eventName - event to publish.
    * @param {Boolean} [bubble] - whether event should bubble or not. True by default.
    * @return {Boolean} - false if a handler has returned false, this will prevent the vent 'bubbling'.
    */
   prototype._publish = function(eventName, bubble) {
      var observers = this._getTopics()[eventName],
         args = Array.prototype.slice.call(arguments, 1),
         returnedValue,
         observersClone;
      
      if (observers) {
         observersClone = observers.slice();
         for (var i = 0, l = observersClone.length; i < l; i++) {
            returnedValue = observersClone[i].handler.apply(observersClone[i].scope || this, args);
            if (observersClone[i].once) {
               observers.splice(i, 1);
            }
            if (returnedValue === false) {
               return false;
            }
         }
      }

      return this._eventsShouldBubble;
   };

   /**
    * Public method to subscribe to a given eventName.
    * Also aliased as 'on'.
    *
    * @method subscribe
    * @chainable
    * @param {String|Object} eventName - event to subscribe to, can be joined via ':'.
    * @param {Function} handler - function to invoke when event is published.
    * @param {Object} [scope] - scope for the handler to be run in. This is useful if you wish to unsubscribe by scope.
    * @param {Boolean} [once] - whether handler should only be triggered once and then unsubscribe.
    * @return {Observer} 'this' for chaining.
    */
   prototype.subscribe = function(eventName, handler, scope, once) {
       eventName = (eventName && typeof eventName.toString === 'function') ?
                        eventName.toString() : eventName;
                        
      if (typeof handler !== 'function') {
         throw new Error('Observer.subscribe: please provide a function as the handler argument.');
      }
      var topics = this._getTopics();
   
      if (!topics[eventName]) {
         topics[eventName] = [];
      }
   
      topics[eventName].push({
         handler: handler,
         scope: scope,
         once: !!once
      });

      return this;
   };
   prototype.on = prototype.subscribe;

   /**
    * Public method to unsubscribe to a given eventName or scope or everything.
    * Also aliased as 'un'.
    
    * @method unsubscribe 
    * @chainable 
    * @param {String|Object} [eventName] - optional eventName to unsubscribe from.
    * @param {Object} [scope] - optional scope to unsubscribe from.
    * @return {Observer} 'this' for chaining.
    */
   prototype.unsubscribe = function(eventName, scope) {
      eventName = (eventName && typeof eventName.toString === 'function') ?
                        eventName.toString() : eventName;
      var topics = this._getTopics();
      [].concat(eventName || Object.keys(topics)).forEach(function(matchedEvent) {
         var topic = topics[matchedEvent];
         if (topic) {
            topics[matchedEvent] = topic.filter(function(observer) {
                if (scope && observer.scope !== scope) {
                  return observer;
               }
            });

            if (!this.hasListeners(matchedEvent)) {
               delete topics[matchedEvent];
            }
         }
      }, this);

      return this;
   };
   prototype.un = prototype.unsubscribe;

   /**
    * Public method to publish to a given eventName. Any arguments supplied will be proxied to the handler.
    * the eventName can be joined via ':' and all events will be called unless a handler returns false then bubbling will be prevented.
    * Also aliased as 'fire'.
    *
    * @method publish
    * @chainable
    * @param {String|Object} eventName - eventName to publish.
    * @return {Observer} 'this' for chaining.
    */
   prototype.publish = function(eventName) {
      eventName = (eventName && typeof eventName.toString === 'function') ?
                        eventName.toString() : eventName;

      var eventsToPublish = Observer._getBubbleEvents(eventName),
         args = Array.prototype.slice.call(arguments, 1),
         eventArgs;
      
      while (eventsToPublish.length) {
         eventArgs = args.slice();
         eventArgs.unshift(eventsToPublish[eventsToPublish.length - 1]);
         if (this._publish.apply(this, eventArgs) === false) {
            break;
         }
         eventsToPublish.pop();
      }

      return this;
   };
   prototype.fire = prototype.publish;

   /**
    * The supplied observer will be subscribed to and stored for easy unsubscribing via the stopListening method.
    * 
    * @method listenTo
    * @chainable
    * @param {Observer} observer - observer instance that to listen to.
    * @param {String|Object} eventName - event to subscribe to, can be joined via ':'.
    * @param {Function} handler - function to invoke when event is published.
    * @return {Observer} 'this' for chaining.
    */
   prototype.listenTo = function(observer, eventName, handler) {
      if (Observer.isObserver(observer)) {
         if (this._observing === null) {
            this._observing = [];
         }
         if (this._observing.indexOf(observer) < 0) {
            this._observing.push(observer);
         }
         observer.subscribe(eventName, handler, this);
      } else {
         throw new Error('Observer.listenTo: please provide an instance of Observer as the "observer" argument.');
      }

      return this;
   };

   /**
    * Stop listening to all observers that have been subscribed to via the listenTo method.
    *
    * @method stopListening
    * @chainable
    * @return {Observer} 'this' for chaining.
    */
    prototype.stopListening = function() {
      if (Array.isArray(this._observing)) {
         this._observing.forEach(function(other) {
            other.unsubscribe(null, this);
         }, this);
      }

      return this;
    };

   /**
    * Utility to check whether a given event has any listeners; if none is supplied then all topics are checked.
    *
    * @method hasListeners
    * @param {String|Object} [eventName] - optional eventName to check.
    * @return {Boolean}
    */
   prototype.hasListeners = function(eventName) {
      var topics = this._getTopics();
      if (eventName) {
         eventName = typeof eventName.toString === 'function' ? eventName.toString() : eventName;
         return !!(topics[eventName] && topics[eventName].length);
      } else {
         return !!Object.keys(topics).length;
      }
   };
   
   /**
    * Static method to get all possible events that can bubble from a given eventName.
    *
    * @param {String} eventName - eventName to split on ':' and return all possible events to bubble.
    * @return {String[]}
    */
   Observer._getBubbleEvents = function(eventName) {
      return eventName.split(':').map(function(splitName, index, eventArr) {
         return eventArr.slice(0, index + 1).join(':');
      });
   };

   /**
    * Static method for using Observer as a mixin.
    *
    * @method mixin
    * @static
    * @param {Object} base - base object to add mixin functionality to.
    * @return {Object}
    */
   Observer.mixin = function(base) {
      if (!base) {
         throw new Error('Observer.mixin: please provide a base object to extend.');
      }
      for (var prop in prototype) {
         if (prototype.hasOwnProperty(prop)) {
            base[prop] = prototype[prop];
          }
      }
      return base;
   };
   
   /**
    * Static method for checking whether given argument is an instance of Observer.
    *
    * @method isObserver
    * @static
    * @param {Object} check - object to check.
    * @return {Boolean}
    */
   Observer.isObserver = function(check) {
      return check && check instanceof Observer;
   };

   return Observer;
}));
