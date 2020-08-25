const path = require('path');
const merge = require('webpack-merge');
const prod = require('./webpack.prod.js');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const publicPath = '/js-object-to-css/';
const outputPath = path.join(__dirname, 'docs');
const assetsPath = path.join(publicPath, 'assets');

module.exports = merge(prod, {
    output: {
        path: outputPath,
        publicPath,
    },
    plugins: [
        new HtmlWebpackPlugin({
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
            patterns: [{ from: './public/assets', to: path.join(outputPath, 'assets') }],
        }),
    ],
});
