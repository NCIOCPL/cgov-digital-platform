const path = require('path');
const baseConfig = require('../webpack.base.config.js');
const themeEntries = require('./webpack.entries.js');

const themeConfig = {
  name: 'cgov_purple',
  entry: themeEntries,
  resolve: {
    modules: [path.resolve(__dirname, '../src'), 'node_modules'],
    alias: {
      "Core": path.resolve(__dirname, '..', 'src'),
      "Utilities": path.resolve(__dirname, '..', 'src', 'utilities'),
      "Polyfills": path.resolve(__dirname, '..', 'src', 'polyfills'),
      "Styles": path.resolve(__dirname, 'src', 'styles'),
      "Libraries": path.resolve(__dirname, 'src', 'libraries'),
      "Sprites": path.resolve(__dirname, 'dist', 'images', 'sprites'),
    }
  },
  output: {
		path: path.join(__dirname, "dist/js"),
  },
}

module.exports = Object.assign({}, baseConfig, themeConfig);
