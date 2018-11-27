const path = require('path');
const baseConfig = require('../webpack.base.config.js');
const themeEntries = require('./webpack.entries.js');

const themeConfig = {
    entry: themeEntries,
    resolve: {
        modules: [path.resolve(__dirname, '../src'), 'node_modules'],
        alias: {
            core: path.resolve(__dirname, '..'),
        }
    },
    output: {
		path: path.join(__dirname, "dist/js")
	},

}

module.exports = Object.assign(baseConfig, themeConfig);