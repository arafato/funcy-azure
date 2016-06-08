'use strict';

const os = require('os'),
    chalk = require('chalk'),
    BbPromise = require('bluebird'),
    fs = BbPromise.promisifyAll(require("fs-extra")),
    FError = require('./../Error'),
    env = require('./../utils/env'),
    io = require('./../utils/io');

class EnvSetHandler {
    constructor() {
        this.context = 'env';
        this.action = 'set';
    }

    process(options) {
        if (!this._checkOptions(options)) {
            throw new FError('You need to provide a name and at least either a local or a cloud value.');
        }

        let name = options.n || options.name;
        let local = options.l || options.local;
        let cloud = options.c || options.cloud;

        let promises = [];
        if (local !== undefined) {
            promises.push(io.updateEnvVar(name, local, env.localVars));
        }

        if (cloud !== undefined) {
            promises.push(io.updateEnvVar(name, cloud, env.cloudVars));
        }

        return BbPromise.all(promises)
            .then(() => {
                console.log(chalk.cyan('All good. Successfully updated environment variables.'));
            });
    }

    help() {
        let help = 'Sets environment variables for local execution and in the cloud.' + os.EOL + os.EOL;
        help += '-n, --name' + os.EOL;
        help += '      The name of the environment variable to create or update' + os.EOL;
        help += '-l, --local' + os.EOL;
        help += '      The value to set in the local context' + os.EOL;
        help += '-c, --cloud' + os.EOL;
        help += '      The value to set in the cloud context' + os.EOL;
        console.log(chalk.cyan(help));
    }

    _checkOptions(options) {
        return !(options.n === undefined && options.name === undefined);
    }
}

module.exports = EnvSetHandler;