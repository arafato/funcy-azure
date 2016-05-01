'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes');

class EnvListHandler {
	constructor() {
		this.context = 'env';
		this.action = 'list';
	}
	
	process(options) {
		
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
}

module.exports = EnvListHandler;