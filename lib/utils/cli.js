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
	art += '[Code] => https://github.com/arafato/funcy-azure' + os.EOL;
	art += '[Docs] => https://funcy-azure.readme.io/' + os.EOL;
	
	console.log(chalk.cyan(art));
}

exports.quickHelp = function (handler) {
	let txt = '';
	txt += chalk.underline.cyan('Commands' + os.EOL);
	txt += '* Pass --help after any <context> <action> to get contextual help.' + os.EOL + os.EOL;
	let contexts = Object.keys(handler);
	contexts.forEach(function(ctx) {
		txt += '"' + ctx + '" actions:' + os.EOL;
		let actions = Object.keys(handler[ctx]);
		actions.forEach(function(action) {
			txt += chalk.cyan('  ' + action + os.EOL);
		}, this);
	}, this);
	 
	console.log(txt);
}