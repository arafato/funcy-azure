'use strict';

const BbPromise = require('bluebird'),
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

exports.readModWriteAsync = readModWriteAsync;