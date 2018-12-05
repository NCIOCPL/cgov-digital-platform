const themes = require('./themes.config.js');

module.exports = themes.map(themeConfigurationPath => require(`./${ themeConfigurationPath}/webpack.config.js`));