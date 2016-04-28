'use strict'

const BbPromise = require('bluebird'),
      fs = require('fs'),
	  path = require('path');

// Global Bluebird Config
BbPromise.promisifyAll(fs);
BbPromise.onPossiblyUnhandledRejection(function(error) {
  throw error;
});
BbPromise.longStackTraces();

class Funcy {
	constructor() {
		this._version = require('./../package.json').version;
		this._handlers = {};
		this.config = {
			HANDLER_PATH: __dirname + '/handlers'
		}
	}
	
	init() {
		let _this = this;
		return BbPromise.try(function() {
			fs.readdirAsync(_this.config.HANDLER_PATH)
				.then(function(files) {
					files.forEach(function(file, index) {
						let Handler = require(path.join(_this.config.HANDLER_PATH, file));
						let h = new Handler();
						_this._handlers[h.context] = _this._handlers[h.context] || {};
						_this._handlers[h.context][h.action] = h;
					});
				})
				.catch(function(e) {
					throw new Error('Could not initialize handlers: ' + JSON.stringify(e));
				});
		});
	}

	command(argv) {
		let cli = {
			context: null,
			action: null,
			raw: argv
		};

		if (cli.raw._[0] === 'version' || cli.raw._[0] === 'v') {
			console.log(this._version);
			return;
		}

		if (cli.raw._.length === 0 &&
			(cli.raw._[0] === 'help' ||
			cli.raw._[0] === 'h' ||
			cli.raw.help ||
			cli.raw.h)) {

			console.log('TODO: SHOW HELP');
			return;
		}

		cli.context = cli.raw._[0];
		cli.action = cli.raw._[1];
		
		if (cli.raw.help) {
			this._handlers[cli.context][cli.action].help();
			return;
		}
		
		this._handlers[cli.context][cli.action].process(cli.raw);
	}
}

module.exports = Funcy;