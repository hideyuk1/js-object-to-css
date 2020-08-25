const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const publicPath = '/';
const outputPath = path.join(__dirname, 'dist');
const assetsPath = path.join(publicPath, 'assets');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.bundle.js',
        path: outputPath,
        publicPath,
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // only enable hot in development
                            hmr: process.env.NODE_ENV === 'development',
                            // if hmr does not work, this is a forceful method.
                            reloadAll: true,
                        },
                    },
                    'css-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
            {
                test: /\.txt$/i,
                use: 'raw-loader',
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),
        new HtmlWebpackPlugin({
            // title: "Webpack 4 Starter",
            template: './public/index.ejs',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: false,
            },
            templateParameters: {
                assetsPath,
            },
        }),

        new CopyPlugin({
            patterns: [{ from: './public/assets', to: path.join(outputPath, assetsPath) }],
        }),

        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
    ],
};
