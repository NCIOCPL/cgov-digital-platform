const path = require('path');
const webpack = require('webpack');
const themes = require('./registeredThemes.js');

module.exports = themes.map(themeConfigurationPath => require(`./${ themeConfigurationPath}/webpack.config.js`));