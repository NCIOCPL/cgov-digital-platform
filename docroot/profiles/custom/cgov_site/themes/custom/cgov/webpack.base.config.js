const path = require('path');
const webpack = require('webpack');

const config = {
    target: 'web',
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist/js'),
    },
}

module.exports = config;