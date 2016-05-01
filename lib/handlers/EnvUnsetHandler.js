'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes');

class EnvUnsetHandler {
	constructor() {
		this.context = 'env';
		this.action = 'unset';
	}
	
	process(options) {
		
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
}

module.exports = EnvUnsetHandler;