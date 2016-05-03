'use strict'

const merge = require('merge'),
      chalk = require('chalk'),
      Types = require('./BindingTypes'),
	  FError = require('./Error.js');


class ContextFactory {
	constructor() {
		this._TEMPLATE_BASE_PATH = './templates/context/';
		this._TEMPLATE_SUFFIX = 'ContextStub.json';
		this._TEMPLATE_HTTP_TRIGGER = this._TEMPLATE_BASE_PATH + Types.HTTP_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_BLOB_TRIGGER = this._TEMPLATE_BASE_PATH + Types.BLOB_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_EVENTHUB_TRIGGER = this._TEMPLATE_BASE_PATH + Types.EVENTHUB_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_TIMER_TRIGGER = this._TEMPLATE_BASE_PATH + Types.TIMER_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_QUEUE_TRIGGER = this._TEMPLATE_BASE_PATH + Types.QUEUE_TRIGGER + this._TEMPLATE_SUFFIX;
	}

	createContext(metadata, args) {
		let context;
		switch (metadata.triggerType) {
			case Types.HTTP_TRIGGER:
				context = require(this._TEMPLATE_HTTP_TRIGGER);
				break;
			case Types.BLOB_TRIGGER:
				context = require(this._TEMPLATE_BLOB_TRIGGER);
				break;
			case Types.EVENTHUB_TRIGGER:
				context = require(this._TEMPLATE_EVENTHUB_TRIGGER);
				break;
			case Types.TIMER_TRIGGER:
				context = require(this._TEMPLATE_TIMER_TRIGGER);
				break;
			case Types.QUEUE_TRIGGER:
				context = require(this._TEMPLATE_QUEUE_TRIGGER);
			default:
				throw new FError('Unknown Trigger-Binding type: ' + metadata.triggerType);
		}

		context.log = function (s) {
			console.log(chalk.yellow('[LOG]: %s'), s);
		}

		context.done = function (err, props) {
			if (err) {
				console.log(chalk.red('FAILED'));
				console.log(chalk.red(JSON.stringify(err)));
				return;
			}

			console.log(chalk.green('SUCCESS'));

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