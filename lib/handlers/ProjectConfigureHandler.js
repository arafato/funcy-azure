'use strict';

const path = require('path'),
    chalk = require('chalk'),
    os = require('os'),
    BbPromise = require('bluebird'),
    inquirer = require('inquirer'),
    FError = require('./../Error'),
    graphRbacManagementClient = require('azure-graph'),
    msRestAzureAsync = BbPromise.promisifyAll(require('ms-rest-azure'),
        {
            filter: function (name) {
                return name === "interactiveLogin";
            },
            multiArgs: true
        }),
    env = require('./../utils/env'),
    io = require('./../utils/io');



class ProjectConfigureHandler {
    constructor() {
        this.context = 'project';
        this.action = 'configure';
    }

    process(options) {
        let tenantId = options.t || options.tenantId || null;
        let password = options.p || options.password || null;
        let identifierUri = options.i || options.identifierUri || null;
        let spName = options.n || options.name || null;

        let p = {
            tenantId: tenantId,
            password: password,
            identifierUri: identifierUri
        };

        let credentials;

        return msRestAzureAsync.interactiveLoginAsync()
            .then((res) => {
                credentials = res[0];
                let subscriptions = res[1];
                let subs = subscriptions.map((i) => { return { subscriptionId: i.id, name: i.name, tenantId: i.tenantId } });
                return this._runInteractive(p, subs);
            })
            .then((answers) => {
                p.tenantId = answers.tenantData.tenantId || p.tenantId;
                p.subscriptionId = answers.tenantData.subscriptionId;
                p.password = answers.password;
                return this._createApplicationAsync(answers, credentials, p.tenantId);
            })
            .then((res) => {
                p.appId = res.appId;
                return this._createServicePrincipalAsync(res.appId, credentials);
            })
            .then((res) => {
                return this._updateAdminConfigAsync(p);
            })
            .catch((e) => {
                console.log(chalk.red('FAILED!'));
                console.log(chalk.red('Ups. Something went wrong. See error message for details.'));
                throw new FError('Unable to configure project: ' + e.message);
            });
    }

    _runInteractive(p, subscriptions) {
        // FLOW:
        // 1. Interactive Login (resource audience), list subscriptions and tenantIds resp. for selection if tenantId === null
        // 2. Ask for password if === null
        // 3. Use auto-generated unique service principal name if not specified
        // 4. Setup deployment credentials (show existing as default values) -> wait for answer on Github
        return BbPromise.try(() => {
            let questions = [];

            if (p.tenantId === null) {
                let choices = [];
                for (let s of subscriptions) {
                    choices.push(s.name);
                }

                questions.push({
                    type: 'list',
                    name: 'tenantData',
                    message: 'Which subscription do you want the service principal to be created in?',
                    choices: choices,
                    filter: (val) => {
                        return subscriptions.filter((i) => {
                            return i.name === val
                        })[0]; // Resulting array always has only one element since subscription name is unique (?)
                    }
                });
            }

            if (p.password === null) {
                questions.push({
                    type: 'password',
                    name: 'password',
                    message: 'Please enter the password:',
                    validate: (value) => {
                        // TODO: add regex for password: let pass = value.match()
                        return true;
                    }
                });
            }

            if (p.identifierUri === null) {
                questions.push({
                    type: 'input',
                    name: 'identifierUri',
                    message: 'Name of the Azure Active Directory Application to be created?',
                    default: 'https://www.contoso.org/example'
                });
            }

            return inquirer.prompt(questions);
        });
    }

    _createApplicationAsync(answers, credentials, tenantId) {
        // Reconfiguring to use graph audience
        credentials.domain = tenantId;
        credentials.tokenAudience = "graph";
        credentials.context._authority._tenant = tenantId;
        credentials.context._authority._url.pathname = '/' + tenantId;
        credentials.context._authority._url.path = '/' + tenantId;
        // Fixme: We are currently supporting only one environment. Add German Cloud, etc. and according endpoints as well 
        credentials.context._authority._url.href = 'https://login.microsoftonline.com/' + tenantId;

        let client = new graphRbacManagementClient(credentials, tenantId);
        client.applications = BbPromise.promisifyAll(client.applications);
        let now = new Date(Date.now());
        let exp = new Date(Date.now());
        exp.setFullYear(exp.getFullYear() + 2);
        let params = {
            availableToOtherTenants: false,
            displayName: 'generated-by-funcyazure',
            homepage: 'https://funcy-azure.readme.io',
            identifierUris: [answers.identifierUri],
            passwordCredentials: [{
                value: answers.password,
                startDate: now,
                endDate: exp
            }]
        };

        return client.applications.createAsync(params)
    }

    _createServicePrincipalAsync(appId, credentials) {
        let client = new graphRbacManagementClient(credentials, credentials.domain);
        client.servicePrincipals = BbPromise.promisifyAll(client.servicePrincipals);
        let params = {
            appId: appId,
            accountEnabled: true
        };
        return client.servicePrincipals.createAsync(params);
    }

    _updateAdminConfigAsync(p) {
        let promises = [];
        promises.push(io.updateEnvVar('tenant_id', p.tenantId, env.adminVars));
        promises.push(io.updateEnvVar('app_id', p.appId, env.adminVars));
        promises.push(io.updateEnvVar('password', p.password, env.adminVars));
        promises.push(io.updateEnvVar('subscription_id', p.subscriptionId, env.adminVars));

        return BbPromise.all(promises)
            .then(() => {
                console.log(chalk.cyan('All good. Successfully configured your project. See admin.env for settings.'));
            });
    }

    help() {
        let help = '(Interactively) configures the Funcy-Azure project in the current directory.' + os.EOL + os.EOL;
        help += '-t, --tenantId' + os.EOL;
        help += '      (Optional) The tenant ID you want your service principal to be created in.' + os.EOL;
        help += '-i, --identifierUri' + os.EOL;
        help += '      (Optional) The identifier URI of your application.' + os.EOL;
        help += '-p, --password' + os.EOL;
        help += '      (Optional) The password you want to use for your service principal.' + os.EOL;

        console.log(chalk.cyan(help));
    }
}

module.exports = ProjectConfigureHandler;
