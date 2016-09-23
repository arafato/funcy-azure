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
        });

class ProjectConfigureHandler {
    constructor() {
        this.context = 'project';
        this.action = 'configure';
    }

    process(options) {
        let tenantId = options.t || options.tenantId || null;
        let password = options.p || options.password || null;
        let spName = options.n || options.name || null;

        let p = {
            tenantId: tenantId,
            password: password,
            spName: spName
        };

        return msRestAzureAsync.interactiveLoginAsync()
            .then((res) => {
                let credentials = res[0];
                let subscriptions = res[1];
                let subs = [];
                for (let sub of subscriptions) {
                    subs.push({ name: sub.name, tenantId: sub.tenantId });
                }
                return this._runInteractive(p, subs);
            })
            .then((answers) => {
                console.log(JSON.stringify(answers, null, 2));
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
                    name: 'tenantId',
                    message: 'Which subscription do you want the service principal to be created in?',
                    choices: choices,
                    filter: (val) => {
                        return val;
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

            if (p.spName === null) {
                questions.push({
                    type: 'input',
                    name: 'spName',
                    message: 'Name of the service principal?',
                    default: 'Funcy-Azure'
                });
            }

            return inquirer.prompt(questions).then((answers) => {
                return answers;
            })
        });
    }

    _createApplication() {

    }

    _createServicePrincipal() {

    }

    help() {
        let help = '(Interactively) configures the Funcy-Azure project in the current directory.' + os.EOL + os.EOL;
        help += '-t, --tenantId' + os.EOL;
        help += '      (Optional) The tenant ID you want your service principal to be created in.' + os.EOL;
        help += '-n, --name' + os.EOL;
        help += '      (Optional) The name of your service principal.' + os.EOL;
        help += '-p, --password' + os.EOL;
        help += '      (Optional) The password you want to use for your service principal.' + os.EOL;

        console.log(chalk.cyan(help));
    }
}

module.exports = ProjectConfigureHandler;
