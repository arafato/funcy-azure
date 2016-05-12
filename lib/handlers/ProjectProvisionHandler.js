'use strict';

const chalk = require('chalk'),
	os = require('os'),
	merge = require('merge'),
	Spinner = require('cli-spinner').Spinner,
	msRestAzure = require('ms-rest-azure'),
	ResourceManagerClient = require('azure-arm-resource').ResourceManagementClient,
	BbPromise = require('bluebird'),
	fs = BbPromise.promisifyAll(require("fs-extra")),
	FError = require('./../Error'),
	env = require('./../utils/env');

class ProjectProvisionHandler {
	constructor() {
		this.context = 'project';
		this.action = 'provision';
	}

	process(options) {
		const cp = env.getAdminCredentials();
		let spinner = null;

		return cp.then((creds) => {
			let credentials = new msRestAzure.ApplicationTokenCredentials(creds.app_id, creds.tenant_id, creds.password);
			let client = new ResourceManagementClient(credentials, creds.subscription_id);
			client.deployments = BbPromise.promisifyAll(client.deployments);
			client.resourceGroups = BbPromise.promisifyAll(client.resourceGroups);

			console.log(chalk.cyan('Starting provisioning your project...' + os.EOL));
			spinner = new Spinner(chalk.cyan('Updating ARM template... %s'));
			spinner.setSpinnerString('|/-\\');
			spinner.start();
			this._updateARMTemplate()
				.then(() => {
					// Validation
					spinner.stop();
					console.log(chalk.green('DONE!'));
					spinner = new Spinner(chalk.cyan('Validating ARM template... %s'));
					spinner.setSpinnerString('|/-\\');
					spinner.start();
					client.deployments.validateAsync(resourceGroupName, deploymentName, deploymentParameters)
				})
				.then(() => {
					// Create/Update Resource Group
					spinner.stop();
					console.log(chalk.green('DONE!'));
					spinner = new Spinner(chalk.cyan('Creating/Updating Resource Group... %s'));
					spinner.setSpinnerString('|/-\\');
					spinner.start();
					client.resourceGroups.createOrUpdateAsync(resourceGroupName, groupParameters);
				})
				.then(() => {
					// Provision template
					spinner.stop();
					console.log(chalk.green('DONE!'));
					spinner = new Spinner(chalk.cyan('Executing ARM template... %s'));
					spinner.setSpinnerString('|/-\\');
					spinner.start();
					return client.deployments.createOrUpdateAsync(resourceGroupName, deploymentName, deploymentParameters);
				})
				.then((res) => {
					spinner.stop();
					console.log(chalk.green('DONE!'));
					console.log(chalk.cyan('******************************************************************'))
					console.log(chalk.cyan('All good. Your project has been successfully provisioned to Azure.'))
					// TODO: Write res to faz.log	
				})
		})
			.catch((e) => {
				spinner.stop();
				console.log(chalk.red('FAILED!'));
				console.log(chalk.red('Ups. Something went wrong. See error message for details.'));
				throw new FError('Unable to provision project: ' + e.message);
			});
	}

	/**
	 * Merges cloud.env variables with template 
	 */
	_updateARMTemplate() {
		return BbPromise.all([
			fs.readFileAsync(path.join(env.rootFolder, 'cloud.env')),
			fs.readFileAsync(path.join(env.rootFolder, 'ARMTemplate.json'))
		])
			.then((params) => {
				let enVars = {};
				let envFile = params[0];
				envFile = envFile.toString('utf8');
				envFile = envFile.replace(/\s+/g, "");
				let keyvals = envFile.split('=');
				for (let i = 0; i <= keyvals.length - 1; i += 2) {
					envVars[keyvals[i]] = keyvals[i + 1];
				}
				let template = params[1];
				template.resources.forEach((r) => {
					if (r.type === 'Microsoft.Web/sites') {
						merge.recursive(r.resources.properties, enVars);
					}
					return template;
				})
			})
			.then((template) => {
				fs.writeFileAsync(path.join(env.rootFolder, 'ARMTemplate.json'), template);
			})
			.catch((e) => {
				throw new FError('Unable to update ARM template with environment variables. Aborting: ' + JSON.stringify(e));;
			});
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