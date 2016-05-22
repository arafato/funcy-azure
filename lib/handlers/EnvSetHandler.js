'use strict';

const os = require('os'),
      chalk = require('chalk');

class EnvSetHandler {
    constructor() {
        this.context = 'env';
        this.action = 'set';
    }
    
    process(options) {
        
    }
    
    help() {
        let help = 'Sets environment variables for local execution and in the cloud.' + os.EOL + os.EOL;
        help += '-n, --name' + os.EOL;
        help += '      The name of the environment variable to create or update' + os.EOL;
        help += '-l, --local' + os.EOL;
        help += '      The value in the local context' + os.EOL;
        help += '-c, --cloud' + os.EOL;
        help += '      The value in the cloud context' + os.EOL;
        console.log(chalk.cyan(help));
    }
}

module.exports = EnvSetHandler;