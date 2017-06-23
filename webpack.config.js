const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = function getWebpackConfig(type) {
    const isProduction = type === 'production';
    return {
        entry: {
            app: ['./src/app']
        },

        output: {},

        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    use: 'babel-loader',
                    include: [
                        path.resolve(__dirname, 'src')
                    ]
                },

                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                minimize: isProduction
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    require('autoprefixer')
                                ]
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                includePaths: [
                                    path.resolve(__dirname, 'node_modules')
                                ]
                            }
                        }
                    ]
                },

                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },

                // https://msdn.microsoft.com/en-us/library/cc848897(v=vs.85).aspx
                {
                    test: /\.png$/,
                    use: 'url-loader?limit=32768&mimetype=image/png'
                },

                {
                    test: /\.gif/,
                    use: 'url-loader?limit=32768&mimetype=image/gif'
                },

                {
                    test: /\.jpg$/,
                    use: 'file-loader'
                },

                {
                    test: /\.(eot|woff|ttf|svg)/,
                    use: 'file-loader'
                }
            ]
        },

        resolve: {
            // Allow to omit extensions when requiring these files
            extensions: ['.js', '.jsx', '.styl', '.scss'],
            alias: {
                react: path.join(__dirname, 'node_modules/react/') // keep this for npm link, otherwise you will get react twice
            }
        },

        plugins: [
            new CircularDependencyPlugin({
                exclude: /node_modules/
            })
        ]
    };
};
