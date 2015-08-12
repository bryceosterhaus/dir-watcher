var gulp = require('gulp');
var path = require('path');
var chalk = require('chalk');
var fs = require('fs-extra');
var watch = require('gulp-watch');
var sass = require('gulp-ruby-sass');
var inquirer = require("inquirer");

// Variables

var config = fs.readJsonSync('config.json');

var numberOfWatchers = [
	{
		type: 'input',
		name: 'numberOfWatchers',
		message: 'How many directories would you like to watch?',
		default: config.length
	}
];

var sourceOptions = {
	name: 'Source',
	verbose: true
};

var sassConfigOptions = {
	compass: true,
	force: true,
	scss: true
}

// Gulp Tasks

gulp.task('config', function(cb) {
	inquirer.prompt(numberOfWatchers, function(answers) {
		var watchersCount = answers.numberOfWatchers;

		var questionsArray = buildQuestions(answers, watchersCount);

		inquirer.prompt(questionsArray, function(answers) {
			var newConfig = writeConfig(answers, watchersCount);

			fs.writeJsonSync('config.json', newConfig);

			cb();
		});
	});
});

gulp.task('watch', function(cb) {
	var config = fs.readJsonSync('config.json');

	for (var i = 0; i < config.length; i++) {
		var configIndex = config[i];

		var sassConfig = configIndex.sassConfig;

		var src = configIndex.source;
		var dest = configIndex.destination;

		console.log(chalk.bgBlack.gray('Listening for changes to') + src + '\n');

		watch(path.join(src,'**/*.*'), sourceOptions, function(event) {
				checkFileType(event, sassConfig);
		}).pipe(gulp.dest(dest));
	}
});

// Methods

function validatePath(filePath) {
	return fs.existsSync(filePath);
}

function checkFileType(event, sassConfig) {
	if (sassConfig) {
		var path = event.path;
		var fileExtension = path.split('.').pop();

		if (fileExtension === 'scss') {
			compileSass(sassConfig);
		}
	}
}

function compileSass(sassConfig) {
	sassConfigOptions.loadPath = [sassConfig.sourceFolder, __dirname + '/src']

	return sass(sassConfig.sourceFolder + sassConfig.buildFile, sassConfigOptions)
		.on('error', function (err) {
			console.error('Error!', err.message);
		})
		.pipe(gulp.dest(sassConfig.destination))
		.on('end', function() {
			console.log(chalk.cyan('Finished Compiling Sass'));
		});
}

function buildQuestions(answers, watchersCount) {
	var questionsArray = [];

	for (var i = 0; i < watchersCount; i++) {
		var index = i;

		var currentObject = config[i]

		if (!currentObject) {
			currentObject = {};
		}

		var source = {
			type: 'input',
			name: i + 'source',
			message: 'Source',
			default: currentObject.source || '',
			validate: validatePath
		};

		questionsArray.push(source);

		var destination = {
			type: 'input',
			name: i + 'destination',
			message: 'Destination',
			default: currentObject.destination || '',
			validate: validatePath
		};

		questionsArray.push(destination);

		var sassConfig = currentObject.sassConfig;

		if (!sassConfig) {
			sassConfig = currentObject;
		}

		var sass = {
			type: 'confirm',
			name: i + 'needSass',
			message: 'Need to compile Sass?',
			default: sassConfig || false
		}

		questionsArray.push(sass);

		var whenFunc = function(answers) {
			var keys = Object.keys(answers);

			var lastKey = keys.pop();

			return answers[lastKey];
		}

		var sassFile = {
			when: whenFunc,
			type: 'input',
			name: i + 'sassFile',
			message: 'Sass File to Compile?',
			default: sassConfig.buildFile || ''
		}

		questionsArray.push(sassFile);

		var sassSource = {
			when: whenFunc,
			type: 'input',
			name: i + 'sassSource',
			message: 'Sass source folder?',
			default: sassConfig.sourceFolder || '',
			validate: validatePath
		}

		questionsArray.push(sassSource);

		var sassDestination = {
			when: whenFunc,
			type: 'input',
			name: i + 'sassDestination',
			message: 'Sass Destination folder?',
			default: sassConfig.destination || '',
			validate: validatePath
		}

		questionsArray.push(sassDestination);
	}

	return questionsArray;
}

function writeConfig(answers, watchersCount) {
	var newConfig = [];

	for (var i = 0; i < watchersCount; i++) {
		var watcher = {
			source: answers[i + 'source'],
			destination: answers[i + 'destination']
		};

		if (answers[i + 'needSass']) {
			var sassConfig = {
				buildFile: answers[i + 'sassFile'],
				sourceFolder: answers[i + 'sassSource'],
				destination: answers[i + 'sassDestination'],
			}

			watcher.sassConfig = sassConfig;
		}

		newConfig.push(watcher);
	}

	return newConfig;
}