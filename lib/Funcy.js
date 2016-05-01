'use strict'

const BbPromise = require('bluebird'),
	  path = require('path'),
	  FCli = require('./utils/cli'),
	  FError = require('./Error');

const fs = BbPromise.promisifyAll(require("fs"));

// Global Bluebird Config
BbPromise.onPossiblyUnhandledRejection(function (err) {
	process.stderr.write(err.stack);
	process.abort();
});
BbPromise.longStackTraces();

class Funcy {
	constructor() {
		this._version = require('./../package.json').version;
		this._handlers = [];
		this.config = {
			HANDLER_PATH: __dirname + '/handlers'
		}
	}
	
	init() {
		let _this = this;
		return fs.readdirAsync(_this.config.HANDLER_PATH)
			.then(function (files) {
				files.forEach(function (file, index) {
					let Handler = require(path.join(_this.config.HANDLER_PATH, file));
					let h = new Handler();
					_this._handlers[h.context] = _this._handlers[h.context] || [];
					_this._handlers[h.context][h.action] = h;
				});
			})
			.catch(function (e) {
				throw new FError('Could not initialize handlers: ' + JSON.stringify(e));
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

		if (cli.raw._.length === 0) {
			FCli.asciiGreeting();
			FCli.quickHelp(this._handlers);
			return;
		}

		cli.context = cli.raw._[0];
		cli.action = cli.raw._[1];
		
		if (cli.raw.help || cli.raw.h || cli.raw._[2] === 'help') {
			this._handlers[cli.context][cli.action].help();
			return;
		}
		
		if (this._handlers[cli.context] === undefined) {
			throw new FError('In the command you just typed context "' + cli.context + '" is not valid. Enter "funcy-azure --help" to see available contexts and actions.');
		}
		
		if (this._handlers[cli.context][cli.action] === undefined) {
			throw new FError('In the command you just typed action "' + cli.action + '" is not valid. Enter "funcy-azure --help" to see available contexts and actions.');
		}

		this._handlers[cli.context][cli.action].process(cli.raw);
	}
}

module.exports = Funcy;