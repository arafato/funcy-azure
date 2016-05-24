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

class DeploymentListHandler {
    constructor() {
        this.context = 'deployment';
        this.action = 'list';
    }

    process(options) {
        if (!this._checkOptions(options)) {
            throw new FError('You need to provide a resource group.');
        }

        let rg = options.g || options.resourceGroup;
        let display = parseInt(options.d || options.display) || 5;
        
        let spinner = new Spinner(chalk.cyan(`Getting last ${display} deployments of project "${project.name}"... %s`));
        spinner.setSpinnerString('|/-\\');
        spinner.start();

        env.getAdminVars()
            .then((creds) => {
                let appTokenCreds = new msRestAzure.ApplicationTokenCredentials(creds.app_id, creds.tenant_id, creds.password);
                let client = new WebSiteManagement(appTokenCreds, creds.subscription_id);
                client.sites = BbPromise.promisifyAll(client.sites);
                return client.sites.getDeploymentsAsync(rg, project.name);
            })
            .then((deployments) => {
                spinner.stop();
                console.log(os.EOL);
                let i = 1;
                for (const d of deployments.value) {
                    if (i > display) {
                        break;
                    }
                    
                    let out = '' + os.EOL; 
                    out += `Deployment Id : ${d.deploymentId}` + os.EOL;
                    out += `Message       : ${d.message}` + os.EOL;
                    out += `Author        : ${d.author}` + os.EOL;
                    out += `Deployer      : ${d.deployer}` + os.EOL;
                    out += `Startime      : ${d.startTime}` + os.EOL;
                    out += `Endtime       : ${d.endTime}` + os.EOL;
                    out += `Status        : ${d.active}` + os.EOL;
                    
                    if (d.active) {
                        console.log(chalk.green(out));
                    } else {
                        console.log(chalk.white(out));
                    }
                    
                    console.log(chalk.gray('*****************************'));
                    ++i;
                }
            })
            .catch((e) => {
                console.error(e.message);
                throw new FError('Unable to get deployments.');
            })
    }

    help() {
        let help = 'Lists all deployments of your application.' + os.EOL + os.EOL;
        help += '-g, --resourceGroup' + os.EOL;
        help += '      The resource group where this project is running.' + os.EOL;
        help += '-d, --display' + os.EOL;
        help += '      Show the last n deployments. Default: 5' + os.EOL;
        console.log(chalk.cyan(help));
    }

    _checkOptions(options) {
        return !(options.g === undefined && options.resourceGroup === undefined);
    }
}

module.exports = DeploymentListHandler;