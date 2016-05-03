'use strict';

const path = require('path'),
	  os = require('os'),
	  chalk = require('chalk'),
	  BbPromise = require('bluebird'),
	  FError = require('./../Error'),
	  Types = require('./../BindingTypes'),
	  fs = BbPromise.promisifyAll(require("fs-extra"));


class FunctionCreateHandler {
	constructor() {
		this.context = 'function';
		this.action = 'create';
	}
	
	process(options) {
		return BbPromise.try(() => {
			let fName = options.n || options.name;
			let eventTrigger = options.e || options.eventTrigger;
			let connectionString = options.c || options.connection;
			
			let functionFolder = path.join(process.cwd(), fName);
			let templateFolder = path.join(__dirname, '../', 'templates/function-js');
			let projectFolder = process.cwd();
			let connectionStringKey = path.basename(projectFolder) + '_' + eventTrigger; 

			return fs.mkdirsAsync(functionFolder)
				.then(BbPromise.join(
					fs.copyAsync(path.join(templateFolder, 'args.json'), path.join(functionFolder, 'args.json')),
					fs.copyAsync(path.join(templateFolder, 'index.js'), path.join(functionFolder, 'index.js')),
					this._createFunctionJson(path.join(functionFolder, 'function.json'), eventTrigger, connectionStringKey),
					this._appendEnvAsync(connectionStringKey, connectionString, projectFolder),
					() => {
						console.log(chalk.cyan('All good. Function "' + fName + '" created successfully.'));
					}))
				.catch((e) => {
					throw new FError(e.message);
				});
		});
	}

	help() {
		let help = 'Creates scaffolding for a new Funcy Azure function.' + os.EOL + os.EOL;
		help += '-n, --name' + os.EOL;
		help += '      A new name for this function' + os.EOL;
		help += '-e, --eventTrigger' + os.EOL;
		help += '      The event type which triggers this function: http | blob | eventhub | timer | queue' + os.EOL;
		help += '-c, --connection' + os.EOL;
		help += '      Optional: The connection string to authorize against the event source (not needed for http event)' + os.EOL;
		console.log(chalk.cyan(help));
	}
	
	_appendEnvAsync(connectionStringKey, connectionString, projectFolder) {
		if (!connectionString) {
			return BbPromise.resolve();
		}
		let env = connectionStringKey + '=' + connectionString;
		return fs.appendFileAsync(path.join(projectFolder, '.env'), env);
	}
	
	_createFunctionJson(path, eventTrigger, connectionStringKey) {
		return BbPromise.try(() => {
			let o = {
				bindings: []
			},
				b = {
				direction: 'in'
			};
			switch (eventTrigger) {
				case 'http':
					b.type = Types.HTTP_TRIGGER;
					b.name = 'req';
					b.webHookType = '';
					o.bindings.push({
						name:'res',
						type: 'http',
						direction: 'out'
					});
					break;
				case 'blob':
					b.type = Types.BLOB_TRIGGER;
					b.name = 'myBlob';
					b.connection = connectionStringKey;
					b.path = 'myBlobStoragePath';
					break;
				case 'eventhub':
					b.type = Types.EVENTHUB_TRIGGER;
					b.name = 'myEventHubMessage';
					b.connection = connectionStringKey;
					b.path = 'myEventHubName'
					break;
				case 'timer':
					b.type = Types.TIMER_TRIGGER;
					b.name = 'myTimer';
					b.schedule = '0 * * * * *';
					break;
				case 'queue':
					b.type = Types.QUEUE_TRIGGER;
					b.name = 'myQueueItem';
					b.queueName = 'myStorageQueueName';
					b.connection = connectionStringKey;
					break;
				default:
					throw new FError('Unknown event trigger type: "' + eventTrigger + '"');
			}
			
			o.bindings.unshift(b);
			return fs.writeFileAsync(path, JSON.stringify(o, null, 4));
		});
	}
}

module.exports = FunctionCreateHandler;