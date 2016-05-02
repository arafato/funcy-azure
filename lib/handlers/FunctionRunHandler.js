'use strict';

const path = require('path'),
	  os = require('os'),
	  chalk = require('chalk'),
	  BbPromise = require('bluebird'),
	  Types = require('./../BindingTypes'),
	  FError = require('./../Error');
	  

class FunctionRunHandler {
	constructor() {
		this.context = 'function';
		this.action = 'run';
	}

	process(options) {
		return BbPromise.try(() => {
			let optFile = options.f || options.file;
			let fName = path.basename(optFile, path.extname(optFile)); // Filename only without extension
			let fPath = path.resolve(process.cwd(), path.dirname(optFile));
			let f = require(path.join(fPath, fName));

			let optInput = options.i || options.input || path.join(fPath, 'args.json');
			let iName = path.basename(optInput, path.extname(optInput)); // Filename only without extension
			let iPath = path.resolve(process.cwd(), path.dirname(optInput));
			let i = require(path.join(iPath, iName));

			let ctxFactory = require('./../ContextFactory');
			let metadata = this._extractFunctionMetadata(fPath);
			let ctx = ctxFactory.createContext(metadata, i);

			let args = [];
			metadata.in.forEach(function (b) {
				args.push(ctx.bindings[b]);
			}, this);

			args.unshift(ctx);
			f.apply(this, args);
		});
	}
	
	help() {
		let help = 'Runs the service locally. Expects a "function.json" file in the function folder.' + os.EOL + 
					'Creates a trigger specific context object and "in" parameters and passes them to your service.' + os.EOL + os.EOL;
		help += '-f, --file' + os.EOL;
		help += '      Path to the function' + os.EOL;
		help += '-i, --input' + os.EOL;
		help += '      (Optional): Path to the input file, assumes args.json in function folder per default'; + os.EOL;
		console.log(chalk.cyan(help)); 
	}
	
	_extractFunctionMetadata(p) {
		let metadata = { out: [], in: [] };
		try {
			var f = require(path.join(p, 'function.json'));
		} catch(e) {
			throw new FError('Missing file "function.json" in your Azure Function folder.');
		}
		f.bindings.forEach(function(binding) {
			let types = Types.toArray();
			let pos = types.indexOf(binding.type); 
			if (pos !== -1) { // We found the Trigger Binding
				metadata.triggerType = types[pos];
			}
			if (binding.direction === 'out' && binding.type !== 'http') { // We store the 'out' bindings to improve visulization of run results
				metadata.out.push(binding.name);
			}
			if (binding.direction === 'in') { // We store the 'in' bindings to pass individual params to the Azure function
				metadata.in.push(binding.name);
			}
		}, this);
		
		return metadata;
	}
}

module.exports = FunctionRunHandler;