var fs = require('fs-extra');
var inquirer = require("inquirer");
var chalk = require('chalk');

var config = fs.readJsonSync('config.json');

function validatePath(filePath) {
	return fs.existsSync(filePath);
}

var numberOfWatchers = process.argv[2] || config.numberOfWatchers;
var watchers = config.watchers;

if (numberOfWatchers) {
	var questionsArray = [];

	for (var i = 0; i < numberOfWatchers; i++) {
		var paths = watchers[i];

		var defaultSource = '';
		var defaultDestination = '';

		if (paths && paths.source && paths.destination) {
			defaultSource = paths.source;
			defaultDestination = paths.destination;
		}

		var source = {
			type: 'input',
			name: 'source' + i,
			message: i + ' Source',
			default: defaultSource,
			validate: validatePath
		};

		questionsArray.push(source);

		var destination = {
			type: 'input',
			name: 'destination' + i,
			message: i + ' Destination',
			default: defaultDestination,
			validate: validatePath
		};

		questionsArray.push(destination);
	}

	inquirer.prompt(questionsArray, function(answers) {
		config.numberOfWatchers = numberOfWatchers;

		console.log('');

		var length = questionsArray.length / 2;

		for (var i = 0; i < length; i++) {
			if (!config.watchers[i]) {
				config.watchers.push({});
			}

			config.watchers[i].source = answers['source' + i];
			config.watchers[i].destination = answers['destination' + i];

			console.log(chalk.yellow('Watching source:') + chalk.green(config.watchers[i].source));
			console.log(chalk.magenta('    Destination: ') + chalk.cyan(config.watchers[i].destination));
			console.log('');
		}


		fs.writeJsonSync('config.json', config);
	});
}