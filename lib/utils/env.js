'use strict';

const BbPromise = require('bluebird'),
      fs = BbPromise.promisifyAll(require("fs-extra")),
      path = require('path');

let rootFolder = path.join(__dirname, '../..');

exports.rootFolder = rootFolder;

exports.getAdminCredentials = function () {
    return fs.readFileAsync(path.join(rootFolder, 'admin.env'))
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