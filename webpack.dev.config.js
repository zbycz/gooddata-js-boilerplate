const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const ip = require('ip');
const getWebpackConfig = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function createDevConfig(config) {
    const serverIp = config.public ? ip.address() : 'localhost';
    const root = `https://${serverIp}:${config.port}`;
    const devConfig = _.assign(getWebpackConfig(), {
        devtool: 'cheap-inline-source-map',

        output: {
            path: path.join(__dirname, 'app'),
            // Specify complete path to force
            // chrome/FF load the images
            publicPath: `${root}/app/`,
            filename: '[name].js'
        }
    });

    _.keysIn(devConfig.entry).forEach((key) => {
        const currentValue = devConfig.entry[key];

        devConfig.entry[key] = [
            'react-hot-loader/patch',
            'webpack/hot/only-dev-server',
            `webpack-hot-middleware/client?${root}`,
            ...currentValue
        ];
    });

    devConfig.plugins = devConfig.plugins.concat(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            DEBUG: true,
            TESTING: false,
            PRODUCTION: false
        }),
        new HtmlWebpackPlugin({
            title: 'App',
            template: 'index.webpack.html'
        })
    );

    return devConfig;
};
