const _ = require('lodash');
const webpack = require('webpack');
const getWebpackConfig = require('./webpack.config.js');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = function createTestConfig(options) {
    const testConfig = _.assign(getWebpackConfig('test'), {
        devtool: 'cheap-inline-source-map'
    });

    testConfig.plugins.push(new webpack.DefinePlugin({
        TESTING: true
    }));
    testConfig.plugins.push(new CircularDependencyPlugin({
        exclude: /node_modules/
    }));

    if (options.codeCoverage) {
        testConfig.module.postLoaders = testConfig.module.postLoaders || [];
        testConfig.module.postLoaders.push({
            test: /app\/.*\.(js$|jsx$)/,
            exclude: /(test|node_modules|app\/lib)\//,
            loader: 'istanbul-instrumenter'
        });
    }

    delete testConfig.entry;
    delete testConfig.output;

    return testConfig;
};
