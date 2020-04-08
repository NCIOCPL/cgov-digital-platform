/***
 * @file
 * Sets app config for initialization.
 */

import initialize from '@nciocpl/glossary-app';

const config = window.glossaryAppSettings;

const initializeGlossaryApp = () => {
  initialize(config);
};

export default initializeGlossaryApp;
