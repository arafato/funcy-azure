'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes');

class ProjectCreateHandler {
	constructor() {
		this.context = 'project';
		this.action = 'create';
	}
	
	process(options) {
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
}

module.exports = ProjectCreateHandler;