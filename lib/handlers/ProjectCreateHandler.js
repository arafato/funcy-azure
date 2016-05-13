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
			this.projectFolder = path.join(process.cwd(), projectName);
			let projectLibFolder = path.join(this.projectFolder, 'lib/'); 
			let templateFolder = path.join(__dirname, '../', 'templates/project');
			
			let tenantId = options.t || options.tenantId || '<your-tenantId>';
			let apppId = options.a || options.appId || '<your-appId>';
			let password = options.p || options.password || '<your-serviceprincipal-password>';
			let subscriptionId = options.s || options.subscriptionId || '<your-subscriptionId>';
			
			return fs.mkdirsAsync(this.projectFolder)
				.then(fs.mkdirsAsync(projectLibFolder))
				.then(BbPromise.join(
					fs.copyAsync(path.join(templateFolder, 'gitignore'), path.join(this.projectFolder, '.gitignore')),
					fs.copyAsync(path.join(templateFolder, 'host.json'), path.join(this.projectFolder, 'host.json')),
					fs.copyAsync(path.join(templateFolder, 'deployment'), path.join(this.projectFolder, '.deployment')),
					fs.copyAsync(path.join(templateFolder, 'deployment.cmd'), path.join(this.projectFolder, 'deployment.cmd')),
					fs.copyAsync(path.join(templateFolder, 'lib.js'), path.join(this.projectFolder, 'lib', 'index.js')),
					fs.copyAsync(path.join(templateFolder, 'package.json'), path.join(projectLibFolder, 'package.json')),
					fs.copyAsync(path.join(templateFolder, 'f-resources-arm.json'), path.join(this.projectFolder, 'f-resources-arm.json')),
					fs.createFileAsync(path.join(this.projectFolder, 'Readme.md')),
					fs.createFileAsync(path.join(this.projectFolder, 'local.env')),
					fs.createFileAsync(path.join(this.projectFolder, 'cloud.env')),
					this._storeCredentials(tenantId, apppId, password, subscriptionId),
					() => {
						console.log(chalk.cyan(`All good. Project "${projectName}" successfully initialized.`));
					}))
				.catch((err) => {
					throw new FError(err.message);
				});
		});
	}
	
	/**
	 * StoreCredentials
	 * Stores below params locally in admin.env (which is git ignored). 
	*/
	_storeCredentials(tenantId, appId, password, subscriptionId) {
		let creds = '';
		creds += `tenant_id=${tenantId}` + os.EOL;
		creds += `app_id=${appId}` + os.EOL;
		creds += `password=${password}` + os.EOL;
		creds += `subscription_id=${subscriptionId}` + os.EOL;
		return fs.writeFileAsync(path.join(this.projectFolder, 'admin.env'), creds);
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