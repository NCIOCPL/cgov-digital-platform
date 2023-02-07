const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  viewportWidth: 1025,
  viewportHeight: 600,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
      // implement node event listeners here
    },
    defaultCommandTimeout: 10000,
    experimentalSessionAndOrigin: true,
    cacheAcrossSpecs: true,
    specPattern: 'cypress/e2e/**/*.feature',
    baseUrl: 'http://127.0.0.1:8888',
  },
});
