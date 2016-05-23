'use strict';

const os = require('os'),
    chalk = require('chalk'),
    BbPromise = require('bluebird'),
    fs = BbPromise.promisifyAll(require("fs-extra")),
    FError = require('./../Error'),
    env = require('./../utils/env');

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
            promises.push(this._updateEnvVars(name, local, env.localVars));
        }

        if (cloud !== undefined) {
            promises.push(this._updateEnvVars(name, cloud, env.cloudVars));
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

    _updateEnvVars(name, val, file) {
        return fs.readFileAsync(file, 'utf8')
            .then((data) => {
                if (data.indexOf(name) !== -1) {
                    let lines = data.split(os.EOL);
                    lines.forEach((line, i) => {
                        if (line.indexOf(name) !== -1) {
                            line = line.substr(line.indexOf(name), name.length + 1); // including '='
                            line += val;
                            lines.splice(i, 1);
                            lines.splice(i, 0, line);
                        }
                    });
                    return fs.writeFileAsync(file, lines.join(os.EOL), 'utf8');
                } else {
                    return fs.appendFileAsync(file, `${name}=${val}` + os.EOL);
                }
            })
            .catch((e) => {
                throw new FError('Could not update ' + file);
            });
    }

    _checkOptions(options) {
        return !(options.n === undefined && options.name === undefined);
    }
}

module.exports = EnvSetHandler;