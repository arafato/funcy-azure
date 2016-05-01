'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes');

class EnvGetHandler {
	constructor() {
		this.context = 'env';
		this.action = 'get';
	}
	
	process(options) {
		
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
}

module.exports = EnvGetHandler;