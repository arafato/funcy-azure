'use strict';

const fs = require('fs'),
      env = require('./env');

let project = null;	
try {
	var res = fs.statSync(env.projectFile);
} catch (e) {
	// NOOP: We are outside of a valid project folder, thus project is null.
}

if (res !== undefined) {
	project = require(env.projectFile);
	
	if (project.versionControl.location === 'local') {
		project.versionControl.location = `https://${project.name}.scm.azurewebsites.net`;
	}
}

module.exports = project;