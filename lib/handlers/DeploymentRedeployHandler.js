'use strict';

const os = require('os'),
    chalk = require('chalk'),
    BbPromise = require('bluebird'),
    msRestAzure = require('ms-rest-azure'),
    WebSiteManagement = require('azure-arm-website'),
    Spinner = require('cli-spinner').Spinner,
    FError = require('./../Error'),
    env = require('./../utils/env'),
    project = require('./../utils/project');

class DeploymentRedeployHandler {
    constructor() {
        this.context = 'deployment';
        this.action = 'redeploy';
    }

    process(options) {
        if (!this._checkOptions(options)) {
            throw new FError('You must specify a resource group, a deployment id, and a location.');
        }

        let rg = options.g || options.resourceGroup;
        let deploymentId = options.d || options.deploymentId;
        let location = options.l || options.location;

        let spinner = new Spinner(chalk.cyan(`Re-deploying deployment [${deploymentId}] to resource group "${rg}"... %s`));
        spinner.setSpinnerString('|/-\\');
        spinner.start();

        env.getAdminVars()
            .then((creds) => {
                let appTokenCreds = new msRestAzure.ApplicationTokenCredentials(creds.app_id, creds.tenant_id, creds.password);
                let client = new WebSiteManagement(appTokenCreds, creds.subscription_id);
                client.sites = BbPromise.promisifyAll(client.sites);
                return client.sites.createDeploymentAsync(rg, project.name, deploymentId, { location: location });
            })
            .then(() => {
              spinner.stop();
              console.log(os.EOL);
              console.log(chalk.green(`All good. Deployment [${deploymentId}] has been successfully re-deployed to resource group "${rg}".`));  
            })
            .catch((e) => {
               console.error(e.message);
               throw new FError(`Unable to redeploy deployment [${deploymentId}].`); 
            });
    }

    help() {
        let help = 'Re-deploys an existing deployment of your application.' + os.EOL + os.EOL;
        help += '-g, --resourceGroup' + os.EOL;
        help += '      The resource group where this project is running.' + os.EOL;
        help += '-l, --location' + os.EOL;
        help += '      The location / region of your application.' + os.EOL;
        help += '-d, --deploymentId' + os.EOL;
        help += '      The deployment id that is to be redeployed' + os.EOL;
        console.log(chalk.cyan(help));
    }

    _checkOptions(options) {
        return !((options.g === undefined && options.resourceGroup === undefined) ||
            (options.d === undefined && options.deploymentId === undefined) ||
            (options.l === undefined && options.location === undefined));
    }
}

module.exports = DeploymentRedeployHandler;