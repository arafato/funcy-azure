'use strict'

const HTTP = 'http',
	  BLOB = 'blob',
	  EVENTHUB = 'eventhub',
	  TIMER = 'timer',
	  QUEUE = 'queue';

function _toArray(obj) {
	let a = [];
	Object.keys(obj).forEach(function (key, i) {
		if (key !== 'toArray') {
			a.push(obj[key]);
		}
	});
	return a;
}

module.exports = {
	TYPES: {
		HTTP: HTTP,
		BLOB: BLOB,
		EVENTHUB: EVENTHUB,
		TIMER: TIMER,
		QUEUE: QUEUE,
		
		toArray: function() {
			return _toArray(this);
		}
	},

	TRIGGER: {
		HTTP_TRIGGER: HTTP + 'Trigger',
		BLOB_TRIGGER: BLOB + 'Trigger',
		EVENTHUB_TRIGGER: EVENTHUB + 'Trigger',
		TIMER_TRIGGER: TIMER + 'Trigger',
		QUEUE_TRIGGER: QUEUE + 'queueTrigger',

		toArray: function () {
			return _toArray(this);
		}
	}
}