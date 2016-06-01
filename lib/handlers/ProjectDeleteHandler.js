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

class ProjectDeleteHandler {
    constructor() {
        this.context = 'project';
        this.action = 'delete';
    }

    process(options) {
        if (!this._checkOptions(options)) {
            throw new FError('You need to specify a resource group.');
        }

        let rg = options.g || options.resourceGroup;
        let spinner = new Spinner(chalk.cyan(`Deleting project "${project.name}" from resource group "${rg}"... %s`));
        spinner.setSpinnerString('|/-\\');
        spinner.start();
        
        env.getAdminVars()
            .then((creds) => {
                let appTokenCreds = new msRestAzure.ApplicationTokenCredentials(creds.app_id, creds.tenant_id, creds.password);
                let client = new WebSiteManagement(appTokenCreds, creds.subscription_id);
                client.sites = BbPromise.promisifyAll(client.sites);
                return client.sites.deleteSiteAsync(rg, project.name, { deleteEmptyServerFarm: "true" });
            })
            .then(() => {
                spinner.stop();
                console.log(chalk.green('DONE!'));
                console.log(chalk.cyan(`All good. Successfully deleted "${project.name}".`));
            })
            .catch((e) => {
                console.log(chalk.red('FAILED!'));
				console.log(chalk.red('Something went wrong. See error message for details.'));
                console.error(e.message);
                throw new FError(`Error deleting "${project.name}". See error output for details.`);
            })
    }

    _checkOptions(options) {
        return !(options.g === undefined && options.resourceGroup === undefined);
    }

    help() {
        let help = 'Deletes the Function App and the App Plan (if empty) from the specified resource group.' + os.EOL + os.EOL;
        help += '-g, --resourceGroup' + os.EOL;
        help += '      The resource group where this project is to be provisioned or updated.' + os.EOL;
        console.log(chalk.cyan(help));
    }

}

module.exports = ProjectDeleteHandler;