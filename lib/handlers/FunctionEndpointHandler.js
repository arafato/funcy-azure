'use strict';

const chalk = require('chalk'),
    BbPromise = require('bluebird'),
    os = require('os'),
    url = require('url'),
    FError = require('./../Error'),
    Types = require('./../BindingTypes'),
    arm = require('./../utils/ARMRest'),
    env = require('./../utils/env'),
    project = require('./../utils/project');

class FunctionEndpointHandler {
    constructor() {
        this.context = 'function';
        this.action = 'endpoint';
    }

    process(options) {
        return BbPromise.try(() => {
            if (!this._checkOptions(options)) {
                throw new FError('No function name has been specified.');
            }
            let endpoints = [];
            let fName = options.n || options.name;
            let rg = options.g || options.resourceGroup;
            let httpFilter = options.o || options.httpOnly || 'true';
            httpFilter = (httpFilter) == 'true';

            return env.getAdminVars()
                .then((creds) => {
                    return this._getEndpoints(creds, rg, fName, httpFilter);
                })
                .then((endpoints) => {
                    endpoints.forEach((endpoint) => {
                        console.log(chalk.white(endpoint.name));
                        console.log(chalk.cyan(' |__' + endpoint.url));
                    })
                })
                .catch((e) => {
                    throw new FError('Error getting the function endpoints: ' + e);
                })
        });
    }

    _checkOptions(options) {
        return !((options.n === undefined && options.name === undefined) ||
            (options.g === undefined && options.resourceGroup === undefined));
    }

    _getEndpoints(creds, rg, fName, httpFilter) {
        return arm.acquireAccessTokenBySPN(creds.tenant_id, creds.app_id, creds.password)
            .then((token) => {
                return arm.listFunctions(creds.subscription_id, rg, project.name, token)
                    .then((functions) => {
                        let httpFunctions = [];
                        console.log(chalk.cyan(`Function deployment info in resource group ${rg}:`));
                        functions.value.forEach((f) => {
                            f.properties.config.bindings.forEach((b) => {
                                if ((b.type !== Types.HTTP_TRIGGER) && httpFilter) {
                                } else {
                                    if (fName !== '*' && f.properties.name.indexOf(fName) !== -1) {
                                        httpFunctions.push(f.properties.name);
                                    } else if (fName === '*') {
                                        httpFunctions.push(f.properties.name);
                                    }
                                }
                            });
                        });
                        return httpFunctions;
                    })
                    .then((httpFunctions) => {
                        // Illiminating duplicates
                        // Fixme: This is ugly, fix above
                        httpFunctions = Array.from(new Set(httpFunctions));
                        let promises = [];
                        httpFunctions.forEach((fName) => {
                            promises.push(arm.getFunctionSecret(creds.subscription_id, rg, project.name, fName, token));
                        });
                        return BbPromise.all(promises);
                    })
                    .then((endpoints) => {
                        let res = [];
                        endpoints.forEach((endpoint) => {
                            let fName = url.parse(endpoint.trigger_url).pathname.split('/').pop();
                            res.push({name: fName, url: endpoint.trigger_url});
                        });
                        return res;
                    })
            });
    }

    help() {
        let help = 'Gets the endpoint (URL) of the specified function(s) including the api secret.' + os.EOL + os.EOL;
        help += '-n, --name' + os.EOL;
        help += '      The name of the function. Pass "*" (with quotation marks) to get the endpoints of all currently deployed functions.' + os.EOL;
        help += '-g, --resourceGroup' + os.EOL;
        help += '      The resource group where the function is deployed.' + os.EOL;
        help += '-o, --httpOnly' + os.EOL;
        help += '      Display http-triggered functions only. Default: true' + os.EOL;
        console.log(chalk.cyan(help));
    }
}

module.exports = FunctionEndpointHandler;