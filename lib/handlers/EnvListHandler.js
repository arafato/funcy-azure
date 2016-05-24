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
                        console.log(v.txt);
                    }
                    return BbPromise.resolve();
                }

                let cloud = [];
                for (const c of this._printSingle(delLocal, res[1], name)) {
                    cloud.push(c);
                }

                // We match equal env vars in both local and cloud and print them right below each other. 
                for (const l of this._printSingle(!delLocal, res[0], name)) {
                    let index = cloud.map((i) => { return i.key }).indexOf(l.key);
                    if (index !== -1) {
                        console.log(l.txt);
                        console.log(cloud[index].txt);
                        cloud.splice(index, 1);
                    } else {
                        console.log(l.txt)
                    }
                }
                // Printing the rest of cloud vars
                cloud.map((i) => { console.log(i.txt) });
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
        let t = type ? chalk.cyan('[Local]') : chalk.magenta('[Cloud]');
        for (const key of Object.keys(envFile)) {
            let txt = `${t} ${key}=${envFile[key]}`;
            if (name === '*') {
                if (type) {
                    yield { key: key, txt: chalk.cyan(txt) };
                } else {
                    yield { key: key, txt: chalk.magenta(txt) };
                }
            } else {
                if (key === name) {
                    if (type) {
                        yield { key: key, txt: chalk.cyan(txt) };
                    }
                    else {
                        yield { key: key, txt: chalk.magenta(txt) };
                    }
                }
            }
        }
    }

    _checkOptions(options) {
        return !(options.n === undefined && options.name === undefined);
    }
}

module.exports = EnvListHandler;