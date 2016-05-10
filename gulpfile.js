var gulp = require('gulp');
var path = require('path');
var chalk = require('chalk');
var fs = require('fs-extra');
var watch = require('gulp-watch');
var sass = require('gulp-ruby-sass');

var sourceOptions = {
	name: 'Source'
};

var destinationOptions = {
	name: 'Destination'
};

var sassConfigOptions = {
	compass: true,
	force: true,
	scss: true
}

gulp.task('watch', function(cb) {
	var config = fs.readJsonSync('config.json');
	var configMap = [];
	var destinationsToWatch = [];
	var sourcesToWatch = [];

	for (var i = 0; i < config.length; i++) {
		var currentObject = config[i];

		var destinationToWatch = path.join(currentObject.destination, '**/*.*');
		var sourceToWatch = path.join(currentObject.source, '**/*.*');

		configMap.push(currentObject.source);

		destinationsToWatch.push(destinationToWatch);
		sourcesToWatch.push(sourceToWatch);
	}

	watch(sourcesToWatch, sourceOptions)
		.on('change', function(event) {
			console.log(chalk.cyan('Source ') + 'saw ' + chalk.magenta(event) + ' changed.');

			var configIndex;

			var fileLocation = '';

			configMap.forEach(
				function(item, index) {
					var match = event.match(item);


					if (match) {
						configIndex = index;

						fileLocation = event.replace(item, '');

						fileLocation = fileLocation.split('/');

						fileLocation.pop();

						fileLocation = fileLocation.join('/');
					}
				}
			);

			if (Number.isInteger(configIndex)) {
				var configObject = config[configIndex];

				var sassConfig = config[configIndex].sassConfig;

				if (sassConfig) {
					checkFileType(event, sassConfig);
				}

				var destination = configObject.destination + fileLocation;

				gulp.src(event).pipe(gulp.dest(destination));
			}
		})
});

// Methods

function validatePath(filePath) {
	return fs.existsSync(filePath);
}

function checkFileType(path, sassConfig) {
	var fileExtension = path.split('.').pop();

	if (fileExtension === 'scss') {
		compileSass(sassConfig);
	}
}

function compileSass(sassConfig) {
	sassConfigOptions.loadPath = [sassConfig.sourceFolder, __dirname + '/src']

	var destination = sassConfig.destination;

	return sass(sassConfig.sourceFolder + sassConfig.buildFile, sassConfigOptions)
		.on('error', function (err) {
			console.error('Error!', err.message);
		})
		.pipe(gulp.dest(destination))
		.on('end', function() {
			console.log(chalk.cyan('Finished Compiling Sass to ') + destination);
		});
}