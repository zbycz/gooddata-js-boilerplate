// Copyright (C) 2007-2016, GoodData(R) Corporation. All rights reserved.
const webpackDistConfig = require('./webpack.dist.config');
const webpackDevConfig = require('./webpack.dev.config');

module.exports = (grunt) => {
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-grizzly');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        main: {
            app: 'app',
            dist: 'dist',
            host: grunt.option('backend') || 'secure.gooddata.com',
            port: grunt.option('port') || 8443,
            public: grunt.option('public') || false,
            webpackOptions: {
                progress: true,
                colors: true,
                publicPath: '/app/',
                keepAlive: true,
                stats: {
                    hash: false,
                    version: false,
                    timings: false,
                    assets: false,
                    chunks: false,
                    chunkModules: false,
                    chunkOrigins: false,
                    modules: false,
                    cached: false,
                    cachedAssets: false,
                    reasons: false,
                    children: false,
                    source: false,
                    errorDetails: true,
                    publicPath: false
                }
            }
        },

        clean: {
            dist: './dist'
        },

        eslint: {
            options: {
                config: '.eslintrc'
            },
            all: {
                src: [
                    '**/*.{js,jsx}',
                    '!dist/**/*',
                    '!node_modules/**/*'
                ]
            }
        },

        webpack: {
            options: grunt.config.get('webpackOptions'),
            dist: webpackDistConfig
        },

        server: {
            dev: {},
            test: {}
        }
    });

    grunt.registerMultiTask('server', () => {
        const middlewareFactory = require('./server');

        const currentTask = grunt.task.current;
        const done = currentTask.async();
        const Grizzly = require('grunt-grizzly');

        const webpackOptions = grunt.config.get('main.webpackOptions');

        const options = {
            stub: middlewareFactory.createMiddleware(webpackDevConfig({
                port: grunt.config.get('main.port'),
                public: grunt.config.get('main.public')
            }), webpackOptions),
            keepAlive: true,
            quiet: false,
            root: '',
            host: grunt.config.get('main.host'),
            port: grunt.config.get('main.port')
        };

        const grizzly = new Grizzly(options);

        // Shutdown & notify on error
        grizzly.on('error', (error) => {
            grunt.log.error('Grizzly error: %s', error);
            grunt.log.error('Stopping task grizzly');

            throw error;
        });

        grizzly.on('start', () => {
            // Continue to next task if keepAlive is not set
            if (!options.keepAlive) {
                done();
            }

            if (!options.quiet) {
                grizzly.printStartedMessage();
            }
        });

        grizzly.on('close', () => {
            grunt.log.error('Grizzly server closed');
            grunt.log.error('Stopping task grizzly');

            done();
        });

        // Start grizzly server
        grizzly.start();
    });

    grunt.registerTask('default', ['dev']);

    grunt.registerTask('validate', ['eslint']);

    grunt.registerTask('dist', [
        'clean:dist',
        'webpack:dist'
    ]);

    grunt.registerTask('dev', [
        'server:dev'
    ]);
};
