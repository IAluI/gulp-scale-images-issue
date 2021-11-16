const gulp = require('gulp');
const config = require('./config/gulp.config');

function register(options) {
    return (tasks) => {
        Object.keys(tasks).forEach((task) => {
            const tackOptions = {
                ...options,
                taskName: task,
            };
            gulp.task(task, require(`./tasks/${tasks[task]}`)(tackOptions));
        });
    };
}

register(config)({
    'clean': 'clean',
    'build:images': 'build-images',
});

gulp.task('default', gulp.series('build:images'));
