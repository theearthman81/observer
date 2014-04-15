(function (root, cls) {
   if (define && define.amd) {
      define(cls);
   } else {
      root.Observer = cls();
   }
}(this, function() {   
   /**
    * Pub/Sub library that allows 'subscribe', 'publish' and 'unsubsribe' methods. 
    *
    * @constructor
    * @name Observer
    * @param {Boolean} [eventsShouldBubble] should events bubble up to parent.
    */
   function Observer(eventsShouldBubble) {
      if (!(this instanceof Observer)) {
        return new Observer(eventsShouldBubble);
      }
      this._eventsShouldBubble = !!eventsShouldBubble;
      this._topics = Object.create(null);
   }

   /**
    * @type {Object}
    */
   Observer.prototype._topics = null;

   /**
    * @type {Boolean}
    */
   Observer.prototype._shouldBubble = false;

   /**
    * Static method to get all possible events that can bubble from a given eventName.
    * @param {String} eventName - eventName to split on ':' and return all possible events to bubble.
    * @return {String[]}
    */
   Observer.getBubbleEvents = function(eventName) {
      return eventName.split(':').map(function(splitName, index, eventArr) {
         return eventArr.slice(0, index + 1).join(':');
      });
   };

   /**
    * Private method to publish an event. 
    * @param {String} eventName - event to publish.
    * @param {Boolean} [bubble] - whether event should bubble or not. True by default.
    * @return {Boolean} - false if a handler has returned false, this will prevent the vent 'bubbling'.
    */
   Observer.prototype._publish = function(eventName, bubble) {
      var observers = this._topics[eventName],
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
    * @param {String|Object} eventName - event to subscribe to, can be joined via ':'.
    * @param {Function} handler - function to invoke when event is published.
    * @param {Boolean} once - whether handler should only be triggered once and then unsubscribe.
    * @return {*} 'this' for chaining.
    */
   Observer.prototype.subscribe = function(eventName, handler, scope, once) {
      if (eventName && typeof eventName.toString === 'function') {
         eventName = eventName.toString();
      } else {
         return this;
      }
   
      if (!this._topics[eventName]) {
         this._topics[eventName] = [];
      }
   
      this._topics[eventName].push({
         handler: handler,
         scope: scope,
         once: !!once
      });
   
      return this;
   };

   /**
    * Public method to unsubscribe to a given eventName or scope or everything.
    * @param {String|Object} [eventName] - optional eventName to unsubscribe from.
    * @param {Object} [scope] optional scope to unsubscribe from.
    * @return {*} 'this' for chaining.
    */
   Observer.prototype.unsubscribe = function(eventName, scope) {  
      eventName = (eventName && typeof eventName.toString === 'function') ? 
                        eventName.toString() : eventName; 
      [].concat(eventName || Object.keys(this._topics)).forEach(function(matchedEvent) {
         var topic = this._topics[matchedEvent];
         if (topic) {
            this._topics[matchedEvent] = topic.filter(function(observer) {
                if (scope && observer.scope !== scope) {
                  return observer;
               }
            });
         
            if (!this._topics[matchedEvent].length) {
               delete this._topics[matchedEvent];
            }
         }
      }, this);
   
      return this;
   };

   /**
    * Public method to publish to a given eventName. Any arguments supplied will be proxied to the handler.
    * the eventName can be joined via ':' and all events will be called unless a handler returns false then bubbling will be prevented.
    * @param {String|Object} eventName - eventName to publish.
    * @return {*} 'this' for chaining.
    */
   Observer.prototype.publish = function(eventName) {
      if (eventName && typeof eventName.toString === 'function') {
         eventName = eventName.toString();
      } else {
         return this;
      }
   
      var eventsToPublish = Observer.getBubbleEvents(eventName),
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
   
   return Observer;
});
