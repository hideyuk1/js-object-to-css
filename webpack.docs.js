const path = require('path');
const merge = require('webpack-merge');
const prod = require('./webpack.prod.js');
const CopyPlugin = require('copy-webpack-plugin');

const publicPath = '/js-object-to-css/assets/';
const outputPath = path.join(__dirname, 'docs');
module.exports = merge(prod, {
    output: {
        path: outputPath,
        publicPath,
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: './public/assets', to: path.join(outputPath, 'assets') }],
        }),
    ],
});
