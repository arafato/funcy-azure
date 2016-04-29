'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes');

class FunctionCreateHandler {
	constructor() {
		this.context = 'function';
		this.action = 'create';
	}
	
	process(options) {
		
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
}

module.exports = FunctionCreateHandler;