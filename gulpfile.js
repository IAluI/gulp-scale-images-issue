const gulp = require('gulp');
const scaleImages = require('gulp-scale-images');
const readMetadata = require('gulp-scale-images/read-metadata');
const flatMap = require('flat-map').default;
const del = require('del');
const glob = require('glob');

const IMG_GLOB = '**/*.{jpeg,jpg,png,webp}';
const SRC = 'images';
const DEST = 'public';
const IMG_CALLBACK = 'callback';
const IMG_PROMISE = 'promise';

gulp.task('build:image-callback', () => {
    const createImages = (file, cb) => {
        readMetadata(file, (err, meta) => {
            if (err) {
                return cb(err);
            }

            const formats = [meta.format, 'webp'];
            const sizes = [200, 300, 400];
            const files = [];
            const commonScale = {
                maxWidth: Math.trunc(meta.width * 0.5),
                withoutEnlargement: false,
                fit: 'cover',
                rotate: true,
                metadata: false,
            };
            formats.forEach((format) => {
                sizes.forEach((width) => {
                    const img = file.clone();
                    img.scale = {
                        ...commonScale,
                        format,
                        maxWidth: width,
                    };
                    img.dirname = `${img.dirname}/${width}`;
                    files.push(img);
                });
            });

            cb(null, files);
        });
    };

    return gulp
        .src(`${SRC}/${IMG_GLOB}`)
        .pipe(flatMap(createImages))
        .pipe(scaleImages())
        .pipe(gulp.dest(`${DEST}/${IMG_CALLBACK}`));
});

gulp.task('build:image-promise', () => {
    const createImages = (file, cb) => {
        cb(
            null,
            new Promise((resolve, reject) => {
                readMetadata(file, (err, meta) => {
                    if (err) {
                        return reject(err);
                    }

                    const formats = [meta.format, 'webp'];
                    const sizes = [200, 300, 400];
                    const files = [];
                    const commonScale = {
                        maxWidth: Math.trunc(meta.width * 0.5),
                        withoutEnlargement: false,
                        fit: 'cover',
                        rotate: true,
                        metadata: false,
                    };
                    formats.forEach((format) => {
                        sizes.forEach((width) => {
                            const img = file.clone();
                            img.scale = {
                                ...commonScale,
                                format,
                                maxWidth: width,
                            };
                            img.dirname = `${img.dirname}/${width}`;
                            files.push(img);
                        });
                    });

                    resolve(files);
                });
            })
        );
    };

    return gulp
        .src(`${SRC}/${IMG_GLOB}`)
        .pipe(flatMap(createImages))
        .pipe(scaleImages())
        .pipe(gulp.dest(`${DEST}/${IMG_PROMISE}`));
});

gulp.task('clean', () => {
    return del(DEST);
});

gulp.task('count', (cb) => {
    console.log(
        `Task "build:image-callback" return ${
            glob.sync(`${DEST}/${IMG_CALLBACK}/${IMG_GLOB}`).length
        } files.`
    );
    console.log(
        `Task "build:image-promise" return ${
            glob.sync(`${DEST}/${IMG_PROMISE}/${IMG_GLOB}`).length
        } files.`
    );
    cb();
});

gulp.task(
    'default',
    gulp.series('clean', 'build:image-callback', 'build:image-promise', 'count')
);
