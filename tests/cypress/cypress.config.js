const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  viewportWidth: 1025,
  viewportHeight: 600,
    retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
      // implement node event listeners here
    },
    defaultCommandTimeout: 20000,
    cacheAcrossSpecs: true,
    // Spec is required, even when provided on command line.
    specPattern: 'cypress/e2e/**/*.feature',
    baseUrl: 'http://127.0.0.1:8888',
  },
});
