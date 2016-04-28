'use strict';

const path = require('path');

class FunctionRunHandler {
	constructor() {
		this.context = 'function';
		this.action = 'run';
	}
	
	process(options) {
		let fName = path.basename(options.f, path.extname(options.f)); // Filename only without extension
		let fPath = path.resolve(process.cwd(), path.dirname(options.f));		
		let f = require(path.join(fPath, fName));

		let iName = path.basename(options.i, path.extname(options.i)); // Filename only without extension
		let iPath = path.resolve(process.cwd(), path.dirname(options.i));
		let i = require(path.join(iPath, iName));
		
		let ctxFactory = require('./../ContextFactory');
		let ctx = ctxFactory.createContext('httpTrigger', i);
		f(ctx);
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
}

module.exports = FunctionRunHandler;