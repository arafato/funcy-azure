'use strict';

class FuncyAzureError extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		Error.captureStackTrace(this, this.constructor.name);
	}
};

module.exports = FuncyAzureError;