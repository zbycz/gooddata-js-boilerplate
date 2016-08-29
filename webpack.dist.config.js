const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const getWebpackConfig = require('./webpack.config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const GitSHAPlugin = require('git-sha-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const pkg = require('./package.json');
const lastCommitSHA = require('sync-exec')('git log -1 --format="%h"').stdout;

const licenseTemplate = '/*! \n * <%= name %> - v<%= version %> \n * Copyright (C) 2007-<%= year %>, GoodData(R) Corporation. All rights reserved.\n * Latest git commit: <%= gitSHA %> * <%= date %> \n */\n';

const uglifyOptions = {
    mangle: true,
    compress: {
        sequences: true,
        'dead_code': true,
        'drop_debugger': true,
        conditionals: true,
        booleans: true,
        unused: true,
        'if_return': true,
        'join_vars': true,
        warnings: false
    }
};

const distConfig = _.assign(getWebpackConfig(), {
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].[chunkgitsha].[hash].js'
    }
});

distConfig.module.loaders.filter(
    definition => definition.loader.indexOf('!css') !== -1
).forEach(loaderDefinition => {
    const loader = loaderDefinition.loader.replace('style!', '');

    loaderDefinition.loader = ExtractTextPlugin.extract('style', loader);
});

distConfig.plugins = distConfig.plugins.concat(
    new GitSHAPlugin({ length: 7 }),

    new webpack.BannerPlugin(_.template(licenseTemplate)({
        name: pkg.name,
        gitSHA: lastCommitSHA,
        year: new Date().getFullYear(),
        date: new Date().toString(),
        version: pkg.version
    }), { raw: true }),

    new ExtractTextPlugin('[name].[chunkgitsha].[hash].css'),
    new webpack.DefinePlugin({
        DEBUG: false,
        TESTING: false,
        PRODUCTION: true,
        'process.env': {
            // This has effect on the react lib size
            'NODE_ENV': JSON.stringify('production')
        }
    }),

    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(uglifyOptions),
    new HtmlWebpackPlugin({
        title: 'GDC_APP_NAME',
        template: 'index.webpack.html',
        ga: 'UA-3766725-14'
    }),

    new CompressionPlugin({
        asset: '[file].gz',
        algorithm: 'gzip',
        regExp: /\.js$|\.html$|\.css$|\.svg$|\.woff$|\.gif$|\.ttf$|\.eot$/
    }),

    function() { // eslint-disable-line func-names
        this.plugin('done', stats => {
            const filename = path.join(__dirname, 'dist', 'stats.json');
            const serializedStats = JSON.stringify(stats.toJson(), null, '\t');

            require('fs').writeFileSync(filename, serializedStats);
        });
    }
);

module.exports = distConfig;
