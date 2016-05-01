'use strict'

const merge = require('merge'),
      chalk = require('chalk'),
      Types = require('./BindingTypes'),
	  FError = require('./Error.js');


class ContextFactory {
	constructor() {
		this._TEMPLATE_BASE_PATH = './templates/';
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
				console.log(chalk.red('FAILED:'));
				console.log(chalk.red(JSON.stringify(err)));
				return;
			}

			console.log(chalk.green('SUCCESS:'));
			if (context.res) {
				console.log(chalk.green('res: ' + JSON.stringify(context.res)));
			}
			
			metadata.out.forEach(function(name) {
				console.log(chalk.green(name + ': ' + JSON.stringify(context.bindings[name])));
			}, this);
		}
		return merge.recursive(context, args);
	}
}

module.exports = new ContextFactory();