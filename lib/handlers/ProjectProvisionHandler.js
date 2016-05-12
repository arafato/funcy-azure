'use strict';

const chalk = require('chalk'),
	  os = require('os'),
	  merge = require('merge');
	  Spinner = require('cli-spinner').Spinner,
	  MsRestAzure = require('ms-rest-azure'),
	  ResourceManagerClient = require('azure-arm-resource').ResourceManagementClient,
	  BbPromise = require('bluebird'),
	  fs = BbPromise.promisifyAll(require("fs-extra")),
	  FError = require('./Error.js');

class ProjectProvisionHandler {
	constructor() {
		this.context = 'project';
		this.action = 'provision';
	}
	
	process(options) {
		this.projectFolder = process.cwd();
		// Update ARM Template
		// Validate Template
		// Create/Update Resource Group
		// Provision template
		
	}
	
	/**
	 * Merges cloud.env variables with template 
	 */
	_updateARMTemplate() {
		return BbPromise.all([
			fs.readFileAsync(path.join(this.projectFolder, 'cloud.env')),
			fs.readFileAsync(path.join(this.projectFolder, 'ARMTemplate.json'))
		])
		.then(([envFile, template]) => {
			let enVars = {};
			data = data.toString('utf8');
			data = data.replace(/\s+/g, "");
			let keyvals = data.split('=');
			for (let i = 0; i <= keyvals.length - 1; i += 2) {
				envVars[keyvals[i]] = keyvals[i + 1];
			}
			template.resources.forEach((r) => {
				if (r.type === 'Microsoft.Web/sites') {
					merge.recursive(r.resources.properties, enVars);
				}
				return template;
			})
		})
		.then((template) => {
			fs.writeFileAsync(path.join(this.projectFolder, 'ARMTemplate.json'), template);
		})
		.catch((e) => {
			throw new FError('Unable to update ARM template with environment variables: '  + JSON.stringify(e));;
		});
	}
	
	_getCredentials() {
		
	}
	
	help() {
		let help = 'Provisions or updates the current state of your project to your Azure subscription.' + os.EOL + os.EOL;
		help += '-g, --resourceGroup' + os.EOL;
		help += '      The resource group where this project is to be provisioned or updated.' + os.EOL;
		help += '-l, --location' + os.EOL;
		help += '      The location where this project is to be provisioned or updated.' + os.EOL;
		help += '-d, --DeploymentName' + os.EOL;
		help += '      Optional - Set a dedicated deployment name. Default: <projectname>' + os.EOL;

		console.log(chalk.cyan(help));
	}
}

module.exports = ProjectProvisionHandler;