'use strict'

module.exports = {
	HTTP_TRIGGER: 'httpTrigger',
	BLOB_TRIGGER: 'blobTrigger',
	EVENTHUB_TRIGGER: 'eventHubTrigger',
	TIMER_TRIGGER: 'timerTrigger',
	QUEUE_TRIGGER: 'queueTrigger',
	
	toArray: function() {
		let _this = this;
		let a = [];
		Object.keys(_this).forEach(function(key, i) {
			if (key !== 'toArray') {
				a.push(_this[key]);
			}
		});
		return a;
	}
}