const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');

module.exports = {
    createMiddleware: function createMiddleware(webpackConfig, webpackOptions) {
        return app => {
            const compiler = webpack(webpackConfig);

            app.use(webpackDevMiddleware(compiler, webpackOptions));

            app.use(require('webpack-hot-middleware')(compiler));
        };
    }
};
