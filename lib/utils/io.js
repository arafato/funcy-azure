'use strict';

const BbPromise = require('bluebird'),
    os = require('os'),
    FError = require('./../Error'),
    fs = BbPromise.promisifyAll(require("fs-extra"));


function readModWriteAsync(input, output, modify) {
    return fs.readJsonAsync(input)
        .then((data) => {
            return modify(data);
        })
        .then((data) => {
            return fs.writeJsonAsync(output, data);
        })
        .catch((e) => {
            console.error(e.message);
            throw new FError('Error during reading, modifying and writing the file ' + input);
        })
}

function updateEnvVar(name, val, file) {
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

exports.readModWriteAsync = readModWriteAsync;
exports.updateEnvVar = updateEnvVar;