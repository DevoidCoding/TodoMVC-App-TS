var path = require('path')
var utils = require('./utils')
var config = require('../config')
var webpack = require('webpack')
var vueLoaderConfig = require('./vue-loader.conf')
var vueTemplateLoaderConfig = require('./vue-template-loader.conf')
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

function stylesLoader(loaders, options) {
    if (config.production) {
        loaders.push({
            loader: 'clean-css-loader',
            options: cleanCssOptions
        })

        return ExtractTextPlugin.extract({
            use: loaders,
            fallback: 'vue-style-loader'
        })
    }

    loaders.unshift('vue-style-loader')

    return loaders
}

module.exports = {
    entry: {
        app: './src/main.ts'
    },
    output: {
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath:
            process.env.NODE_ENV === 'production'
                ? config.build.assetsPublicPath
                : config.dev.assetsPublicPath
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            watch: './src' // optional but improves performance (less stat calls)
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                // Fix extract-loader: https://github.com/peerigon/extract-loader/issues/16
                output: {},
                htmlLoader: {
                    minimize: config.production
                },
                stylus: {
                    use: [],
                    preferPathResolver: 'webpack'
                }
            }
        })
    ],
    resolve: {
        extensions: ['.js', '.vue', '.ts', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js'
        },
        modules: [resolve('src'), 'node_modules']
    },
    resolveLoader: {
        alias: {
            view:
                'vue-template-loader?' +
                JSON.stringify({
                    scoped: true,
                    transformToRequire: {
                        img: 'src'
                    }
                })
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig
            },
            {
                test: /\.html$/,
                loader: 'vue-template-loader',
                exclude: resolve('index.html'),
                options: vueTemplateLoaderConfig
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('test')]
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                            transpileOnly: true // Disable type checking to run it in fork
                        }
                    }
                ],
                include: [resolve('src'), resolve('test')]
            },
            {
                enforce: 'pre',
                test: /\.styl$/,
                use: 'stylus-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    }
}
