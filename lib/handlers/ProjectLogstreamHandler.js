'use strict';

const os = require('os'),
    chalk = require('chalk'),
    request = require('request'),
    FError = require('./../Error'),
    env = require('./../utils/env'),
    project = require('./../utils/project');

class ProjectLogstreamHandler {
    constructor() {
        this.context = 'project';
        this.action = 'logstream';
    }

    process(options) {
        env.getAdminVars()
            .then((creds) => {
                if (!this._checkOptions(options, creds)) {
                    throw new FError('No username and/or password has been specified. Check admin.env or pass as arguments (see --help).');
                }

                let username = options.u || options.userName || creds.gituser,
                    password = options.p || options.password || creds.gitpassword,
                    url = `https://${username}:${password}@${project.name}.scm.azurewebsites.net/logstream`;
                    
                console.log(chalk.cyan(`Connecting you to the logstream service of "${project.name}"...`))
                request.get(url).pipe(process.stdout);
            });
    }

    _checkOptions(options, creds) {
        return !(((options.u === undefined && options.userName === undefined) ||
            (options.p === undefined && options.password === undefined)) &&
            (creds.gituser === undefined && creds.gitpassword));
    }

    help() {
        let help = 'Outputs the current logstream of your application to stdout.' + os.EOL + os.EOL;
        help += '-u, --userName' + os.EOL;
        help += '      The username you have specified as Azure Git username.' + os.EOL;
        help += '-p, --password' + os.EOL;
        help += '      The password you have specified as Azure Git Password.' + os.EOL;
        console.log(chalk.cyan(help));
    }

}

module.exports = ProjectLogstreamHandler;