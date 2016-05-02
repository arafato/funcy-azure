'use strict';

const path = require('path'),
	  Types = require('./../BindingTypes'),
	  FError = require('./../Error'),
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
		return BbPromise.try(() => {
			let projectName = options.n || options.name;
			let projectFolder = path.join(process.cwd(), projectName);
			let projectLibFolder = path.join(projectFolder, 'lib/'); 
			let templateFolder = path.join(__dirname, '../', 'templates/project');
			
			return fs.mkdirsAsync(projectFolder)
				.then(fs.mkdirsAsync(path.join(projectFolder, 'lib/')))
				.then(BbPromise.join(
					fs.copyAsync(path.join(templateFolder, 'gitignore'), path.join(projectFolder, '.gitignore')),
					fs.copyAsync(path.join(templateFolder, 'host.json'), path.join(projectFolder, 'host.json')),
					fs.copyAsync(path.join(templateFolder, 'deployment'), path.join(projectFolder, '.deployment')),
					fs.copyAsync(path.join(templateFolder, 'deployment.cmd'), path.join(projectFolder, 'deployment.cmd')),
					fs.copyAsync(path.join(templateFolder, 'package.json'), path.join(projectLibFolder, 'package.json')),
					fs.createFileAsync(path.join(projectFolder, 'Readme.md')),
					fs.createFileAsync(path.join(projectFolder, '.env')),
					(() => {
						console.log(chalk.cyan(`All good. Project "${projectName}" successfully initialized.`));
					})))						
				.catch((err) => {
					throw new FError(err.message);
				});
		});
	}
	
	help() {
		let help = 'Creates scaffolding for a new Funcy Azure project.' + os.EOL + os.EOL;
		help += '-n, --name' + os.EOL;
		help += '      A new name for this Funcy Azure project';
		console.log(chalk.cyan(help));
	}
}

module.exports = ProjectCreateHandler;