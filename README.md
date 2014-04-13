TODO
```javascript
function log(eventName) {
	return function() {
		console.log(eventName, 'fired ', ' arguments', arguments, ' scope', this);
	};
}

var o = new Observer();
o.subscribe('ee', log('ee'), window);
o.subscribe('ee', log('ee'), 'ggg');
o.subscribe('ee:ff', log('ee:ff'), window);
o.subscribe('ee:ff', log('ee:ff'), window);
o.subscribe('ee:ff:gg', log('ee:ff:gg'), window);
o.subscribe('ee:ff:gg', log('ee:ff:gg'), window);
o.subscribe('ee:ff:gg', log('ee:ff:gg'), 'ggg');
o.subscribe('ee:ff:gg', log('ee:ff:gg'), 'ggg');

o.publish('ee', 'myArg');
o.publish('ee:ff', 'myArg', 'myArg2');
o.publish('ee:ff:gg', 'myArg3');
```