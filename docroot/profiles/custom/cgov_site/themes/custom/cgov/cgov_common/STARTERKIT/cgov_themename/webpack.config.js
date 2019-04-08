const path = require('path');
const baseConfig = require('../webpack.base.config.js');
const themeEntries = require('./webpack.entries.js');

const themeConfig = {
  name: 'cgov_themename',
  entry: themeEntries,
  resolve: {
    modules: [path.resolve(__dirname, '../src'), 'node_modules'],
    alias: {
      "Core": path.resolve(__dirname, '..', 'src'),
      "Utilities": path.resolve(__dirname, '..', 'src', 'utilities'),
      "Polyfills": path.resolve(__dirname, '..', 'src', 'polyfills'),
      "Styles": path.resolve(__dirname, 'src', 'styles'),
      "Libraries": path.resolve(__dirname, 'src', 'libraries'),
    }
  },
  output: {
		path: path.join(__dirname, "dist/js"),
  },
}

module.exports = Object.assign({}, baseConfig, themeConfig);
