'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes'),
	  chalk = require('chalk'),
	  os = require('os'),	  
	  BbPromise = require('bluebird'),
	  fs = BbPromise.promisifyAll(require("fs-extra"));

class ProjectCreateHandler {
	constructor() {
		this.context = 'project';
		this.action = 'create';
	}
	
	process(options) {
		let optName = options.n || options.name;
		// Create .gitignore, README.md, host.json, lib/, 
		// .deployment (see https://github.com/projectkudu/kudu/wiki/Customizing-deployments#deployment-file)
		// .env for (local) environment variables (gitignored)
	}
	
	help() {
		let help = 'Creates scaffolding for a new Funcy Azure project.' + os.EOL + os.EOL;
		help += '-n, --name' + os.EOL;
		help += '      A new name for this Funcy Azure project';
		console.log(chalk.cyan(help));
	}
}

module.exports = ProjectCreateHandler;