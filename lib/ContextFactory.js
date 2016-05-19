'use strict'

const merge = require('merge'),
      chalk = require('chalk'),
      Events = require('./BindingTypes'),
	  FError = require('./Error.js');


class ContextFactory {
	constructor() {
		this._TEMPLATE_BASE_PATH = './templates/context/';
		this._TEMPLATE_SUFFIX = 'ContextStub.json';
		this._TEMPLATE_HTTP_TRIGGER = this._TEMPLATE_BASE_PATH + Events.TRIGGER.HTTP_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_BLOB_TRIGGER = this._TEMPLATE_BASE_PATH + Events.TRIGGER.BLOB_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_EVENTHUB_TRIGGER = this._TEMPLATE_BASE_PATH + Events.TRIGGER.EVENTHUB_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_TIMER_TRIGGER = this._TEMPLATE_BASE_PATH + Events.TRIGGER.TIMER_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_QUEUE_TRIGGER = this._TEMPLATE_BASE_PATH + Events.TRIGGER.QUEUE_TRIGGER + this._TEMPLATE_SUFFIX;
	}

	createContext(metadata, args) {
		let context;
		switch (metadata.triggerType) {
			case Events.TRIGGER.HTTP_TRIGGER:
				context = require(this._TEMPLATE_HTTP_TRIGGER);
				break;
			case Events.TRIGGER.BLOB_TRIGGER:
				context = require(this._TEMPLATE_BLOB_TRIGGER);
				break;
			case Events.TRIGGER.EVENTHUB_TRIGGER:
				context = require(this._TEMPLATE_EVENTHUB_TRIGGER);
				break;
			case Events.TRIGGER.TIMER_TRIGGER:
				context = require(this._TEMPLATE_TIMER_TRIGGER);
				break;
			case Events.TRIGGER.QUEUE_TRIGGER:
				context = require(this._TEMPLATE_QUEUE_TRIGGER);
			default:
				throw new FError('Unknown Trigger-Binding type: ' + metadata.triggerType);
		}

		context.log = function () {
			var args = Array.prototype.slice.call(arguments);
			args.unshift('[LOG]');
			console.log.apply(this, args.map((arg) => chalk.yellow(arg)));
		}

		context.done = function (err, props) {
			if (err) {
				console.log(chalk.red('EXECUTION FAILED.'));
				console.log(chalk.red(JSON.stringify(err)));
				return;
			}
			
			props = props || {};

			console.log(chalk.green('SUCCESSFUL EXECUTION!'));

			if (metadata.out.length > 0) {
				console.log(chalk.green('OUTPUT BINDINGS:'));
				metadata.out.forEach(function (b) {
					// Properties passed to context.done overwrite out bindings
					// See https://azure.microsoft.com/de-de/documentation/articles/functions-reference-node/
					if (b.type === 'http') {
						if (props[b.name]) {
							context[b.name] = merge.recursive(context[b.name], props[b.name]);
						}
						console.log(chalk.green(b.name + ': ' + JSON.stringify(context[b.name], null, 4)))
					} else {
						if (props[b.name]) {
							context.bindings[b.name] = merge.recursive(context.bindings[b.name], props[b.name]);
						}
						console.log(chalk.green(b.name + ': ' + JSON.stringify(context.bindings[b.name], null, 4)));
					}
				}, this);
			}			
		}
		return merge.recursive(context, args);
	}
}

module.exports = new ContextFactory();