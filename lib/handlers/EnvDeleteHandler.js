'use strict';

const os = require('os'),
    chalk = require('chalk'),
    BbPromise = require('bluebird'),
    fs = BbPromise.promisifyAll(require("fs-extra")),
    FError = require('./../Error'),
    env = require('./../utils/env');

class EnvDeleteHandler {
    constructor() {
        this.context = 'env';
        this.action = 'delete'
    }

    process(options) {
        if (!this._checkOptions(options)) {
            throw new FError('You need to specify a name.');
        }

        let name = options.n || options.name;
        let delLocal = options.l || options.local || false;
        delLocal = (delLocal) == 'true';
        let delCloud = options.c || options.cloud || false;
        delCloud = (delCloud) == 'true';
        
        let promises = [];
        if (delLocal) {
            promises.push(this._deleteEnvVar(name, env.localVars));
        }
        if (delCloud) {
            promises.push(this._deleteEnvVar(name, env.cloudVars));
        }
        
        if (promises.length === 0) {
            console.log(chalk.cyan('You have not specified a context (local, cloud) where to delete the variable from. You need to explicitly specify the context. See --help'));
            return BbPromise.resolve();
        }
        
        return BbPromise.all(promises)
            .then(() => {
                let local = delLocal ? 'local.env' : '';
                let cloud = delCloud ? 'cloud.env' : '';
                let and = (delLocal && delCloud) ? ' and ' : '';
                console.log(chalk.cyan(`All good. Environment variable "${name}"" successfully delete from ${local} ${and} ${cloud}`));
            });
    }

    help() {
        let help = 'Deletes an environment variable from local and/or cloud context.' + os.EOL + os.EOL;
        help += '-n, --name' + os.EOL;
        help += '      The name of the environment variable to delete' + os.EOL;
        help += '-l, --local' + os.EOL;
        help += '      Delete from local context? Default: false' + os.EOL;
        help += '-c, --cloud' + os.EOL;
        help += '      Delete from cloud context? Default: false' + os.EOL;
        console.log(chalk.cyan(help));
    }

    _deleteEnvVar(name, file) {
        return fs.readFileAsync(file, 'utf8')
            .then((data) => {
                if (data.indexOf(name) === -1) {
                    throw new FError(`Environment variable "${name}" does not exist in ${file}."`);
                }
                
                let lines = data.split(os.EOL);
                lines.forEach((line, i) => {
                    if (line.indexOf(name) !== -1) {
                        lines.splice(i, 1);
                    }
                });
                return fs.writeFileAsync(file, lines.join(os.EOL), 'utf8');
            });
    }

    _checkOptions(options) {
        return !(options.n === undefined && options.name === undefined);
    }
}

module.exports = EnvDeleteHandler;