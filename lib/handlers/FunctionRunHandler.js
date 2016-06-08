'use strict';

const path = require('path'),
    os = require('os'),
    chalk = require('chalk'),
    BbPromise = require('bluebird'),
    request = require('request'),
    rp = require('request-promise'),
    fs = BbPromise.promisifyAll(require('fs-extra')),
    Transform = require('stream').Transform,
    FError = require('./../Error'),
    Events = require('./../BindingTypes'),
    env = require('./../utils/env'),
    project = require('./../utils/project'),
    io = require('./../utils/io');

class FunctionRunHandler {
    constructor() {
        this.context = 'function';
        this.action = 'run';
    }

    process(options) {
        if (!this._checkOptions(options)) {
            throw new FError('You need to specify the name (-n, --name) and/or the resource group (-g, --resourceGroup) of the function you would like to invoke.');
        }

        let fName = options.n || options.name,
            rg = options.g || options.resourceGroup;

        env.getAdminVars()
            .then((creds) => {
                let username = options.u || options.username || creds.deployment_username,
                    password = options.p || options.password || creds.deployment_password,
                    authkey = options.k || options.key || creds.authkey;

                if ((username === undefined || password === undefined) && authkey === undefined) {
                    console.log(chalk.red('No authorization key has been specified (neither in admin.env nor vi CLI).'));
                    console.log(chalk.red('The key is needed in order to call your function.'));
                    console.log(chalk.red('FAZ can automatically fetch and store that key if you specify your deployment username and password (either via CLI or admin.env).'));
                    console.log(chalk.red('See https://azure.microsoft.com/en-us/documentation/articles/web-sites-publish-source-control/ how to setup the deployment credentials.'));
                    console.log(chalk.red('Aborting.'));
                    process.exit(1);
                } else {
                    // Fetch and store authkey (masterkey) in admin.env in case no key has been specified via CLI or admin.env
                    if (authkey === undefined) {
                        console.log(chalk.cyan('[FAZ] Fetching and caching master key in admin.env...'))
                        let adress = `https://${username}:${password}@${project.name}.scm.azurewebsites.net/api/vfs/data/functions/secrets/host.json`;
                        let options = {
                            method: 'GET',
                            uri: adress,
                            json: true
                        };

                        return rp(options)
                            .then((data) => {
                                return io.updateEnvVar('authkey', data.masterKey, env.adminVars);
                            });
                    }
                }
            })
            .then(() => {
                console.log(chalk.cyan(`Triggering ${fName}...`));
                return this._buildRequestOptions(fName);
            })
            .then((options) => {
                return rp(options);
            })
            .then((data) => {
                if (data === undefined) { // non-http triggered, no output 
                    console.log(chalk.cyan(`Successfully triggered ${fName}. See log stream (faz project logstream) for log output.`));
                } else {
                    console.log(chalk.cyan(`OUTPUT: ${data}.`));
                }
            })
            .catch((e) => {
                console.error(e.message);
                throw new FError(`There was an unexpected error triggering "${fName}". See stderr for details.`);
            });
    }

    help() {
        let help = 'Triggers the function execution on Azure. Expects a "function.json" file in the function folder.' + os.EOL;
        help += '-n, --name' + os.EOL;
        help += '      Name of the function you would like to invoke on Azure.' + os.EOL;
        help += '-g, --resourceGroup' + os.EOL;
        help += '      The resource group where the function is deployed.' + os.EOL;
        help += '-i, --input' + os.EOL;
        help += '      (Optional): Path to the input file, assumes args.json in according function folder per default' + os.EOL;
        help += '-u, --username' + os.EOL;
        help += '      (Optional): Deployment username, needed for fetching log output. Overwrites value in admin.env' + os.EOL;
        help += '-p, --password' + os.EOL;
        help += '      (Optional): Deployment password, needed for fetching log output. Overwrites value in admin.env' + os.EOL;
        help += '-k, --key' + os.EOL;
        help += '      (Optional): The master or function key to authorize function execution. Overwrites value "authkey" in admin.env' + os.EOL;
        // This feature will be only available with version 0.6
        // help += '-e, --environment' + os.EOL;
        // help += '      The environment where to trigger the function: prod | staging (default)'; + os.EOL;
        console.log(chalk.cyan(help));
    }

    _checkOptions(options, creds) {
        return !((options.n === undefined && options.name === undefined) ||
            (options.g === undefined && options.resourceGroup === undefined));
    }

    _buildRequestOptions(fName) {
        return BbPromise.try(() => {
            try {
                var f = require(path.join(env.projectFolder, fName, 'function.json'));
            } catch (e) {
                throw new FError('Missing file "function.json" in your Azure Function folder.');
            }

            let trigger = {};
            for (let binding of f.bindings) {
                let types = Events.TRIGGER.toArray();
                let pos = types.indexOf(binding.type);
                if (pos !== -1) { // We found the Trigger Binding
                    trigger.type = binding.type;
                    trigger.name = binding.name;
                    break;
                }
            }
            if (trigger.type === undefined) {
                throw new FError('There is no trigger-type specified in your "function.json".')
            }

            try {
                var args = require(path.join(env.projectFolder, fName, 'args.json'));
            } catch (e) {
                throw new FError('Missing file "args.json" in your Azure Function folder.');
            }

            let options = { method: 'POST', json: true};
            let queryParams = '';
            if (trigger.type === Events.TRIGGER.HTTP_TRIGGER) {
                if (args.bindings.req.method === 'GET' || !args.bindings.req.method) { // GET per default
                    queryParams = encodeURIComponent(this._convertQueryParams(args.bindings.req.query));
                    // options.uri = `https://${project.name}.azurewebsites.net/api/${fName}?${queryParams}`;
                    options.uri = `https://${project.name}.azurewebsites.net/api/HttpTriggerNodeJS1?name=azure`;
                    options.method = 'GET';
                } else { // assuming POST/PUT request
                    options.uri = `https://${project.name}.azurewebsites.net/api/${fName}`;
                    options.body = JSON.stringify(args.bindings.req.body);
                }
            } else { // processing non-http triggered functions
                options.uri = `https://${project.name}.azurewebsites.net/admin/functions/${fName}`;
                let value = args.bindings[trigger.name];
                options.body = value !== undefined ? JSON.stringify({ input: value }) : JSON.stringify({});
            }

            return env.getAdminVars()
                .then((creds) => {
                    options.headers = { "Content-Type": "application/json", "x-functions-key": creds.authkey };
                    return options;
                });
        });
    }

    _convertQueryParams(queryObj) {
        let qp = '';
        for (let prop in queryObj) {
            qp += `&${prop}=${queryObj[prop]}`;
        }
        return qp;
    }
}

class LogPrefix extends Transform {
    constructor(prefix, options) {
        if (!options) options = {};
        options.objectMode = true;
        super(options);
        this.prefix = prefix;
    }

    _transform(obj, encoding, cb) {
        obj = chalk.yellow(`${this.prefix} ${obj}`);
        this.push(obj);
        cb();
    }
}

module.exports = FunctionRunHandler;