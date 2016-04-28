'use strict'

var merge = require('merge');
var chalk = require('chalk');
var Types = require('./BindingTypes');

class ContextFactory {
	constructor() {
		this._TEMPLATE_BASE_PATH = './templates/';
		this._TEMPLATE_SUFFIX = 'ContextStub.json';
		this._TEMPLATE_HTTP_TRIGGER = this._TEMPLATE_BASE_PATH + Types.HTTP_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_BLOB_TRIGGER = this._TEMPLATE_BASE_PATH + Types.BLOB_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_EVENTHUB_TRIGGER = this._TEMPLATE_BASE_PATH + Types.EVENTHUB_TRIGGER + this._TEMPLATE_SUFFIX;
		this._TEMPLATE_TIMER_TRIGGER = this._TEMPLATE_BASE_PATH + Types.TIMER_TRIGGER + this._TEMPLATE_SUFFIX;

	}
	createContext(type, args) {
		let context;
		switch (type) {
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
			default:
				throw Error('Unknown Binding Type: ' + type);
		}
		
		context.log = function(s) {
			console.log(chalk.yellow('LOG: %s'), s);
		}
		
		context.done = function(err, props) {
			if (err) {
				console.log(chalk.red('FAILED:'));
				console.log(chalk.red(JSON.stringify(err)));
				return;
			}
			
			console.log(chalk.green('SUCCESS:'));
			console.log(chalk.green(JSON.stringify(context.res || {})));
		}
		
		return merge(context, args);
	}
}

module.exports = new ContextFactory();