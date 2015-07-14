var gulp = require('gulp');
var path = require('path');
var chalk = require('chalk');
var fs = require('fs-extra');
var watch = require('gulp-watch');

// Variables

var config = fs.readJsonSync('config.json');

var sourceOptions = {
	name: 'Source',
	verbose: true
};

var destinationOptions = {
	name: 'Destination',
	verbose: true
};

// Methods

function printError(error) {
	console.log(chalk.red(error));
}

function startGulpWatch(src, dest) {
	console.log(chalk.bgBlack.gray('Starting watcher...'));

	watch(path.join(src,'**/*.*'), sourceOptions)
		.pipe(gulp.dest(dest));

	watch(path.join(dest,'**/*.*'), destinationOptions);

	console.log(chalk.bgBlack.gray('Listening for changes to') + src + '\n');
}

if (config && config.watchers) {
	var watchers = config.watchers;
	var length = watchers.length;

	for (var i = 0; i < length; i++ ) {
		var currentEntity = watchers[i];

		startGulpWatch(currentEntity.source, currentEntity.destination);
	}
}