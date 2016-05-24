'use strict';

const os = require('os'),
    chalk = require('chalk'),
    BbPromise = require('bluebird'),
    fs = BbPromise.promisifyAll(require("fs-extra")),
    FError = require('./../Error'),
    env = require('./../utils/env');

class EnvListHandler {
    constructor() {
        this.context = 'env';
        this.action = 'list';
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

        return BbPromise.join(env.getLocalVars(), env.getCloudVars())
            .then((res) => {
                if (delLocal && !delCloud || !delLocal && delCloud) {
                    let envFile = delLocal ? res[0] : res[1];
                    for (const v of this._printSingle(delLocal, envFile, name)) {
                        console.log(v);
                    }
                    return BbPromise.resolve();
                }
                
                for (const v of this._printSingle(!delLocal, res[0], name)) {
                    console.log(v);
                }
                for (const v of this._printSingle(delLocal, res[1], name)) {
                    console.log(v);
                }
                return BbPromise.resolve();
            });
    }

    help() {
        let help = 'Lists environment variables currently defined in the local and/or cloud context.' + os.EOL + os.EOL;
        help += '-n, --name' + os.EOL;
        help += '      The name of the environment variable to list. Type "*" to list all.' + os.EOL;
        help += '-l, --local' + os.EOL;
        help += '      Show local context only. Default: false' + os.EOL;
        help += '-c, --cloud' + os.EOL;
        help += '      Show cloud context only. Default: false' + os.EOL;
        console.log(chalk.cyan(help));
    }

    *_printSingle(type, envFile, name) {
        let t = type ? chalk.white('[Local]') : chalk.magenta('[Cloud]');
        for (const key of Object.keys(envFile)) {
            if (name === '*') {
                yield chalk.cyan(`${t} ${key}=${envFile[key]}`);
            } else {
                if (key === name) {
                    yield chalk.cyan(`${t} ${key}=${envFile[key]}`);
                }
            }
        }
    }

    _checkOptions(options) {
        return !(options.n === undefined && options.name === undefined);
    }
}

module.exports = EnvListHandler;