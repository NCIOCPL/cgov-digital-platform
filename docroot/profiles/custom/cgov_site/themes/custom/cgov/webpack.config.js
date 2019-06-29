const themes = require('./themes.config.js');

module.exports = Object.keys(themes).map(themeConfigurationPath => require(`./${ themeConfigurationPath}/webpack.config.js`));