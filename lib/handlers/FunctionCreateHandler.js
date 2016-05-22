'use strict';

const path = require('path'),
	  os = require('os'),
	  chalk = require('chalk'),
	  BbPromise = require('bluebird'),
	  fs = BbPromise.promisifyAll(require("fs-extra")),
	  FError = require('./../Error'),
	  Events = require('./../BindingTypes'),
	  env = require('./../utils/env');

class FunctionCreateHandler {
	constructor() {
		this.context = 'function';
		this.action = 'create';
	}
	
	process(options) {
		return BbPromise.try(() => {
			if (!this._checkOptions(options)) {
				throw new FError('Missing name or wrong event trigger type.');
			}
			
			let fName = options.n || options.name;
			let eventTrigger = options.e || options.eventTrigger;
			let connectionStringValue = options.c || options.connection;
			let connectionStringKey = env.projectName + '_' + fName + '_' + eventTrigger; 
			let functionFolder = path.join(env.projectFolder, fName);
			let authLevel = options.a || options.authLevel || 'function';
			let templatesFunctionsJsFolder = path.join(env.fazTemplatesFolder, 'function-js');

			return fs.mkdirsAsync(functionFolder)
				.then(BbPromise.join(
					fs.copyAsync(path.join(templatesFunctionsJsFolder, 'args.json'), path.join(functionFolder, 'args.json')),
					fs.copyAsync(path.join(templatesFunctionsJsFolder, eventTrigger + '_index.js'), path.join(functionFolder, 'index.js')),
					this._createFunctionJson(path.join(functionFolder, 'function.json'), eventTrigger, authLevel, connectionStringKey),
					this._appendEnvAsync(connectionStringKey, connectionStringValue),
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
		help += '-a, --authLevel' + os.EOL;
		help += '      The authorization level: function | annonymous | admin. Default: function' + os.EOL;
		help += '-c, --connection' + os.EOL;
		help += '      Optional: The connection string to authorize against the event source (not needed for http event)' + os.EOL;
		console.log(chalk.cyan(help));
	}
	
	_checkOptions(options) {
		return !((options.e !== undefined && options.eventTrigger !== undefined) ||
		    	 (options.n !== undefined && options.name !== undefined) ||
				 (Events.TYPES.toArray().indexOf(options.e || options.eventTrigger) === -1));
	}
	
	_appendEnvAsync(connectionStringKey, connectionStringValue) {
		if (!connectionStringValue) {
			return BbPromise.resolve();
		}
		let envVar = connectionStringKey + '=' + connectionStringValue + os.EOL;
		return fs.appendFileAsync(env.cloudVars, envVar);
	}
	
	_createFunctionJson(path, eventTrigger, authLevel, connectionStringKey) {
		return BbPromise.try(() => {
			let o = {
				bindings: []
			},
				b = {
				direction: 'in',
			};
			switch (eventTrigger) {
				case 'http':
					b.type = Events.TRIGGER.HTTP_TRIGGER;
					b.name = 'req';
					b.webHookType = '';
					b.authLevel = authLevel;
					o.bindings.push({
						name:'res',
						type: 'http',
						direction: 'out'
					});
					break;
				case 'blob':
					b.type = Events.TRIGGER.BLOB_TRIGGER;
					b.name = 'myBlob';
					b.connection = connectionStringKey;
					b.path = 'myBlobStoragePath';
					break;
				case 'eventhub':
					b.type = Events.TRIGGER.EVENTHUB_TRIGGER;
					b.name = 'myEventHubMessage';
					b.connection = connectionStringKey;
					b.path = 'myEventHubName'
					break;
				case 'timer':
					b.type = Events.TRIGGER.TIMER_TRIGGER;
					b.name = 'myTimer';
					b.schedule = '0 * * * * *';
					break;
				case 'queue':
					b.type = Events.TRIGGER.QUEUE_TRIGGER;
					b.name = 'myQueueItem';
					b.queueName = 'myStorageQueueName';
					b.connection = connectionStringKey;
					break;
				default:
					throw new FError('Unknown event trigger type: "' + eventTrigger + '"');
			}
			
			o.bindings.unshift(b);
			return fs.writeFileAsync(path, JSON.stringify(o, null, 2));
		});
	}
}

module.exports = FunctionCreateHandler;