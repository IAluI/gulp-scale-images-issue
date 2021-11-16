const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const flatMap = require('flat-map').default;
const readMetadata = require('gulp-scale-images/read-metadata');

const through = require('through2');

const onError = $.notify.onError(
    'Line: <%= error.lineNumber %>: <%= error.message %>\n<%= error.fileName %> title: <%= error.plugin %>'
);

module.exports = (config) => () => {
    let imageConfig = require(`${process.cwd()}/${
        config.paths.imageDir
    }/images-config.json`);
    imageConfig = imageConfig.map((item, index, arr) => {
        item.regExp = new RegExp(item.regExp);
        return item;
    });

    /* This implementation lost some files */
    const createImages = (file, cb) => {
        readMetadata(file, (err, meta) => {
            if (err) {
                return cb(err);
            }
            const curConfig = imageConfig.find((item, index) => {
                return item.regExp.test(file.relative);
            });

            const formats = [];
            if (Array.isArray(curConfig.formats)) {
                curConfig.formats.forEach((item) => {
                    if (item === 'initial') {
                        formats.push(meta.format);
                    } else {
                        formats.push(item);
                    }
                });
            } else {
                formats.push(meta.format);
            }
            const files = [];
            const commonScale = {
                maxWidth: meta.width,
                withoutEnlargement: false,
                fit: 'cover',
                rotate: true,
                metadata: false,
            };
            formats.forEach((format) => {
                if (curConfig.transform) {
                    curConfig.transform.sizes.forEach((width) => {
                        const img = file.clone();
                        img.scale = {
                            ...commonScale,
                            format,
                            maxWidth: width,
                            maxHeight: width * curConfig.transform.aspectRatio,
                        };
                        img.dirname = `${img.dirname}/${width}`;
                        files.push(img);
                    });
                } else {
                    const img = file.clone();
                    img.scale = {
                        ...commonScale,
                        format,
                    };
                    files.push(img);
                }
            });

            cb(null, files);
        });
    };
    
    /* This implementation works well */
    /* const createImages = (file, cb) => {
        const meta = {
            format: 'jpeg',
            width: 600,
        };

        const curConfig = imageConfig.find((item, index) => {
            return item.regExp.test(file.relative);
        });

        const formats = [];
        if (Array.isArray(curConfig.formats)) {
            curConfig.formats.forEach((item) => {
                if (item === 'initial') {
                    formats.push(meta.format);
                } else {
                    formats.push(item);
                }
            });
        } else {
            formats.push(meta.format);
        }
        const files = [];
        const commonScale = {
            maxWidth: meta.width,
            withoutEnlargement: false,
            fit: 'cover',
            rotate: true,
            metadata: false,
        };
        formats.forEach((format) => {
            if (curConfig.transform) {
                curConfig.transform.sizes.forEach((width) => {
                    const img = file.clone();
                    img.scale = {
                        ...commonScale,
                        format,
                        maxWidth: width,
                        maxHeight: width * curConfig.transform.aspectRatio,
                    };
                    img.dirname = `${img.dirname}/${width}`;
                    files.push(img);
                });
            } else {
                const img = file.clone();
                img.scale = {
                    ...commonScale,
                    format,
                };
                files.push(img);
            }
        });

        cb(null, files);
    }; */

    const computeFileName = (output, scale, cb) => {
        const fileName = `${output.stem}.${scale.format}`;
        cb(null, fileName);
    };

    return (
        gulp
            .src(`${config.paths.imageDir}/**/*.{jpeg,jpg,png}`)
            .pipe($.plumber({ errorHandler: onError }))
            .pipe(flatMap(createImages))
            .pipe(
                through.obj((file, _, cb) => {
                    console.log(
                        '--',
                        `${file.dirname}\\${file.stem}.${file.scale.format}`
                    );
                    cb(null, file);
                })
            )
            .pipe($.scaleImages(computeFileName))
            .pipe(
                gulp.dest(`${config.paths.dist}/${config.output.images}/resp`)
            )
    );
};
