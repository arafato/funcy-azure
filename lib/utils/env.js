'use strict';

const BbPromise = require('bluebird'),
      fs = BbPromise.promisifyAll(require("fs-extra")),
      path = require('path');

let rootFolder = path.join(__dirname, '../..');

function envToObject(fullPath) {
    return fs.readFileAsync(fullPath)
        .then((file) => {
            let enVars = {};
            data = data.toString('utf8');
            data = data.replace(/\s+/g, "");
            let keyvals = data.split('=');
            for (let i = 0; i <= keyvals.length - 1; i += 2) {
                envVars[keyvals[i]] = keyvals[i + 1];
            }
            return envVars
        });
}

exports.rootFolder = rootFolder;

exports.projectName = path.basename(rootFolder);

exports.getAdminVars = function () {
    return envToObject(path.join(rootFolder, 'admin.env'));
}

exports.getCloudVars = function() {
    return envToObject(path.join(rootFolder, 'cloud.env'));
}

exports.getLocalVars = function() {
    return envToObject(path.join(rootFolder, 'local.env'));
}