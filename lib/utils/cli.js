'use strict';

const chalk = require('chalk'),
	  os = require('os');

exports.asciiGreeting = function() {
	let version = require('../../package.json').version;
	let art = 
`·▄▄▄▄• ▄▌ ▐ ▄  ▄▄·  ▄· ▄▌     ▄▄▄· ·▄▄▄▄•▄• ▄▌▄▄▄  ▄▄▄ .
▐▄▄·█▪██▌•█▌▐█▐█ ▌▪▐█▪██▌    ▐█ ▀█ ▪▀·.█▌█▪██▌▀▄ █·▀▄.▀·
██▪ █▌▐█▌▐█▐▐▌██ ▄▄▐█▌▐█▪    ▄█▀▀█ ▄█▀▀▀•█▌▐█▌▐▀▀▄ ▐▀▀▪▄
██▌.▐█▄█▌██▐█▌▐███▌ ▐█▀·.    ▐█ ▪▐▌█▌▪▄█▀▐█▄█▌▐█•█▌▐█▄▄▌
▀▀▀  ▀▀▀ ▀▀ █▪·▀▀▀   ▀ •      ▀  ▀ ·▀▀▀ • ▀▀▀ .▀  ▀ ▀▀▀ 
`;
	
	art += 'Funcy Azure, Version ' + version + os.EOL;
	art += 'The Azure Functions Application Framework' + os.EOL;
	art += 'https://github.com/arafato/funcy-azure' + os.EOL;
	
	console.log(chalk.yellow(art));
}