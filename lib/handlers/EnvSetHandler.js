'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes');

class EnvSetHandler {
	constructor() {
		this.context = 'env';
		this.action = 'set';
	}
	
	process(options) {
		
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
}

module.exports = EnvSetHandler;