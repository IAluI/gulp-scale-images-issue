const del = require('del');

module.exports = (config) => () => {
    const forDelete = [config.paths.dist];
    if (config.isDevelopment) {
        forDelete.push(config.output.ssr);
    }
    return del(forDelete);
};
