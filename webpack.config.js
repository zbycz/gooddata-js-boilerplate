const path = require('path');
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = function getWebpackConfig(type) {
    const isTest = type === 'test';

    // Resolve presets and plugins to fix when dependencies
    // are npm linked
    // https://github.com/babel/babel-loader/issues/149
    const babelOptions = JSON.stringify({
        cacheDirectory: true,
        presets: [
            'es2015',
            'stage-0',
            'react'
        ].map(name => require.resolve(`babel-preset-${name}`)),

        plugins: [
            isTest ? 'rewire' : 'lodash',
            'transform-runtime',
            'transform-proto-to-assign',
            'transform-decorators-legacy'
        ].map(name => require.resolve(`babel-plugin-${name}`))
    });

    return {
        entry: {
            app: ['./app/app']
        },

        output: {},

        module: {
            noParse: [
                'jquery'
            ],

            loaders: [
                {
                    test: /\.jsx?$/,
                    loader: `babel?${babelOptions}`,
                    include: /app\/|\/(gdc-)?goodstrap\/|\/(gdc-)?js-utils\/|\/gdc-indigo-visualizations\/|\/node_modules\/gooddata(-js)?\/|karma.tests.js/,
                    exclude: /\/(gdc-)?goodstrap\/node_modules\/|\/(gdc-)?js-utils\/node_modules\/|\/gooddata(-js)?\/node_modules\//
                },

                {
                    test: /\.scss$/,
                    loader: `style!css?sourceMap!autoprefixer!sass?includePaths[]=${path.resolve(__dirname, 'node_modules')}&includePaths[]=${path.resolve(__dirname, 'node_modules/foundation-sites/scss')}`
                },

                {
                    test: /\.css$/,
                    loader: 'style!css?sourcemap'
                },

                // https://msdn.microsoft.com/en-us/library/cc848897(v=vs.85).aspx
                {
                    test: /\.png$/,
                    loader: 'url-loader?limit=32768&mimetype=image/png'
                },

                {
                    test: /\.gif/,
                    loader: 'url-loader?limit=32768&mimetype=image/gif'
                },

                {
                    test: /\.jpg$/,
                    loader: 'file-loader'
                },

                {
                    test: /\.json$/,
                    loader: 'json-loader'
                },

                {
                    test: /\.(eot|woff|ttf|svg)/,
                    loader: 'file-loader'
                },

                {
                    test: /jquery\.js$/,
                    loader: 'expose?jQuery'
                },

                {
                    test: /jquery\.browser\.js$/,
                    loader: 'exports?window.jQBrowser'
                },

                {
                    test: require.resolve('react'),
                    loader: 'expose?React'
                },

                {
                    test: /zynga-scroller-es6\/src\/.*\.js$/,
                    loader: `babel?${babelOptions}`
                },

                {
                    test: /react-dnd-touch-backend.*\.js$/,
                    loader: `babel?${babelOptions}`
                }
            ]
        },

        resolve: {
            // Allow to omit extensions when requiring these files
            extensions: ['', '.js', '.jsx', '.styl', '.scss'],
            modulesDirectories: [
                'node_modules',
                path.join('node_modules/goodstrap/packages')
            ],
            alias: {
                'react': path.join(__dirname, 'node_modules/react/'),
                'js-utils': path.join(__dirname, 'node_modules/js-utils/'),
                'gooddata': path.join(__dirname, 'node_modules/gooddata/src/gooddata'),
                'immutable': path.join(__dirname, 'node_modules/immutable/dist/immutable'),
                'lodash': path.join(__dirname, 'node_modules/lodash'),
                'jquery': path.join(__dirname, 'node_modules/jquery/dist/jquery'),
                'jquery-browser': path.join(__dirname, 'node_modules/jquery.browser/dist/jquery.browser'),
                'jquery-extensions': path.join(__dirname, 'node_modules/goodstrap/packages/core/jquery-extensions'),
                'picker': path.join(__dirname, 'node_modules/pickadate/lib/picker'),
                'pickadate': path.join(__dirname, 'node_modules/pickadate/lib/picker.date'),
                'react-dnd-touch-backend': path.join('react-dnd-touch-backend/src/Touch.js')
            }
        },

        plugins: [
            new webpack.NormalModuleReplacementPlugin(/\/\w+\/styles\/themes\//, requestObject => {
                requestObject.request = requestObject.request.replace(/.*\/(\w+)\/styles\/themes\/(.*)/, '../../node_modules/goodstrap/packages/$1/styles/themes/$2');
            }),
            new webpack.NormalModuleReplacementPlugin(/^\$$/, 'jquery'),
            new webpack.NormalModuleReplacementPlugin(/^jQuery$/, 'jquery'),
            new webpack.ProvidePlugin({
                React: 'react',
                $: 'jquery'
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/
            })
        ]
    };
};
