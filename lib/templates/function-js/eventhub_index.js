'use strict';

var lib = require('../lib');

module.exports = function (context) {
	context.log('The answer to everything is ' + lib.add(31, 11));
	context.done();
}