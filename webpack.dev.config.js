const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const getWebpackConfig = require('./webpack.config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function createDevConfig(config) {
    const root = `https://localhost:${config.port}`;
    const devConfig = _.assign(getWebpackConfig(), {
        devtool: 'cheap-inline-source-map',

        output: {
            path: path.join(__dirname, 'analyze'),
            // Specify complete path to force
            // chrome/FF load the images
            publicPath: `${root}/analyze/`,
            filename: '[name].js'
        }
    });

    _.keysIn(devConfig.entry).forEach(key => {
        const currentValue = devConfig.entry[key];

        devConfig.entry[key] = currentValue.concat(
            'webpack/hot/dev-server',
            `webpack-hot-middleware/client?${root}`
        );
    });

    devConfig.module.loaders.forEach(loaderDef => {
        if (loaderDef.test.toString().indexOf('.js') > 0) {
            loaderDef.loader = `react-hot!${loaderDef.loader}`;
        }
    });

    devConfig.plugins = devConfig.plugins.concat(
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            DEBUG: true,
            TESTING: false,
            PRODUCTION: false
        }),
        new HtmlWebpackPlugin({
            title: 'Analyze',
            template: 'index.webpack.html',
            ga: 'UA-3766725-6',
            embedded: false
        }),
        new HtmlWebpackPlugin({
            title: 'Analyze - Embedded',
            template: 'index.webpack.html',
            ga: 'UA-3766725-6',
            embedded: true,
            filename: 'embedded/index.html'
        })
    );

    return devConfig;
};
