const path = require('path');
const webpack = require('webpack');
const baseConfig = require('../webpack.base.config');
const themeConfig = require('./webpack.entries.js');

module.exports = Object.assign(baseConfig, themeConfig);