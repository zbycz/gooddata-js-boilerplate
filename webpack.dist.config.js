/* eslint max-len: 0 */
const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const getWebpackConfig = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const cp = require('child_process');

const lastCommitSHA = cp.execSync('git log -1 --format="%h"', { encoding: 'utf8' }).trim();

const pkg = require('./package.json');

const licenseTemplate = '/*! \n * <%= name %> - v<%= version %> \n * Copyright (C) 2007-<%= year %>, GoodData(R) Corporation. All rights reserved.\n * Latest git commit: <%= gitSHA %> * <%= date %> \n */\n';

const uglifyOptions = {
    mangle: true,
    compress: {
        sequences: true,
        dead_code: true,
        drop_debugger: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        warnings: false
    }
};

const distConfig = _.assign(getWebpackConfig('production'), {
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: `[name].${lastCommitSHA}.[hash].js`
    }
});

distConfig.module.rules.filter(
    definition => definition.test.toString().match(/(css|scss)/)
).forEach((definition) => {
    // eslint-disable-next-line no-param-reassign
    definition.use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: definition.use.slice(1)
    });
});

const banner = _.template(licenseTemplate)({
    name: pkg.name,
    gitSHA: lastCommitSHA,
    year: new Date().getFullYear(),
    date: new Date().toString(),
    version: pkg.version
});

distConfig.plugins = distConfig.plugins.concat(
    new webpack.BannerPlugin({ banner, raw: true }),

    new ExtractTextPlugin({
        filename: `[name].${lastCommitSHA}.[hash].css`,
        allChunks: true
    }),

    new webpack.DefinePlugin({
        DEBUG: false,
        TESTING: false,
        PRODUCTION: true,
        'process.env': {
            // This has effect on the react lib size
            NODE_ENV: JSON.stringify('production')
        }
    }),

    new webpack.optimize.UglifyJsPlugin(uglifyOptions),
    new HtmlWebpackPlugin({
        title: 'App',
        template: 'index.webpack.html'
    }),

    new CompressionPlugin({
        asset: '[file].gz',
        algorithm: 'gzip'
    }),

    function() { // eslint-disable-line func-names
        this.plugin('done', (stats) => {
            const filename = path.join(__dirname, 'dist', 'stats.json');
            const serializedStats = JSON.stringify(stats.toJson(), null, '\t');

            require('fs').writeFileSync(filename, serializedStats);
        });
    }
);

module.exports = distConfig;
