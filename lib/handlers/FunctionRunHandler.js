'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes');

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
		let metadata = this._extractFunctionMetadata(fPath);
		let ctx = ctxFactory.createContext(metadata, i);
		f.apply(this, ctx, metadata.in);
	}
	
	help() {
		console.log('Contextual help text of ' + this.context + " " + this.action);
	}
	
	_extractFunctionMetadata(p) {
		let metadata = { out: [], in: [] };
		try {
			var f = require(path.join(p, 'function.json'));
		} catch(e) {
			throw Error('Missing function.json');
		}
		f.bindings.forEach(function(binding) {
			let types = Types.toArray();
			let pos = types.indexOf(binding.type); 
			if (pos !== -1) { // We found the Trigger Binding
				metadata.triggerType = types[pos];
			}
			if (binding.direction === 'out') { // We store the 'out' bindings to improve visulization of run results
				metadata.out.push(binding.name);
			}
			if (binding.direction === 'in') { // We store the 'in' bindings to pass individual params to the Azure function
				metadata.in.push(binding.name);
			}
		}, this);
	}
}

module.exports = FunctionRunHandler;