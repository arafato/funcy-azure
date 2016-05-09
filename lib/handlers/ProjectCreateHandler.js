'use strict';

const path = require('path'),
	  chalk = require('chalk'),
	  os = require('os'),	  
	  BbPromise = require('bluebird'),
	  Types = require('./../BindingTypes'),
	  FError = require('./../Error'),
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
					fs.copyAsync(path.join(templateFolder, 'lib.js'), path.join(projectFolder, 'lib', 'index.js')),
					fs.copyAsync(path.join(templateFolder, 'package.json'), path.join(projectLibFolder, 'package.json')),
					fs.createFileAsync(path.join(projectFolder, 'Readme.md')),
					fs.createFileAsync(path.join(projectFolder, '.env')),
					fs.createFileAsync(path.join(projectFolder, 'admin.env')),
					() => {
						console.log(chalk.cyan(`All good. Project "${projectName}" successfully initialized.`));
					}))						
				.catch((err) => {
					throw new FError(err.message);
				});
		});
	}
	
	/**
	 * CreateARMTemplate
	 * Creates an ARM template in the root directory of the project. 
	 * The template can be extended incrementally and redeployed.
	 */
	_createARMTemplate() {
		
	}
	
	/**
	 * StoreCredentials
	 * Stores below params locally in admin.env (which is git ignored). 
	*/
	_storeCredentials(tenantId, appId, password, subscription) {
		
	}
	
	help() {
		let help = 'Creates scaffolding for a new Funcy Azure project.' + os.EOL + os.EOL;
		help += '-n, --name' + os.EOL;
		help += '      A new unique name for this Funcy Azure project (<name>.azurewebsites.net)' + os.EOL;
		help += '-t, --tenantId';
		help += '      The tenant ID you want to use to grant Funcy Azure access to your resources.' + os.EOL;
		help += '-a, --appId' + os.EOL;
		help += '      The App ID (aka Service Principal ID) you want to use to grant Funcy Azure access to your resources.' + os.EOL;
		help += '-p, --password' + os.EOL;
		help += '      The password you created for the service principal (certificates are not supported yet).' + os.EOL;
		help += '-s, --subscriptionId' + os.EOL;
		help += '      The Azure subscription ID where your project will be provisioned.' + os.EOL;

		console.log(chalk.cyan(help));
	}
}

module.exports = ProjectCreateHandler;