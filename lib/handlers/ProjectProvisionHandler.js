'use strict';

const chalk = require('chalk'),
	  os = require('os'),
	  Spinner = require('cli-spinner').Spinner,
	  MsRestAzure = require('ms-rest-azure'),
	  ResourceManagerClient = require('azure-arm-resource').ResourceManagementClient,
	  BbPromise = require('bluebird');


class ProjectProvisionHandler {
	constructor() {
		this.context = 'project';
		this.action = 'provision';
	}
	
	process(options) {
		
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