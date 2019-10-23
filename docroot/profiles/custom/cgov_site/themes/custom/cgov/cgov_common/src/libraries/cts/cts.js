import { ClinicalTrialsServiceFactory } from '@nciocpl/clinical-trials-search-client.js'
import ctsReactApp from '@nciocpl/clinical-trials-search-app';

//assumes import { ClinicalTrialsServiceFactory } from '@nciocpl/clinical-trials-search-client.js' is good to go
const ctsSearch = () => {
  const hostName = 'clinicaltrialsapi.cancer.gov';
  const service = ClinicalTrialsServiceFactory.create(hostName);
  return service;
};

// this will probably be changed to pull from window config
// ex. const config = window.nciCTSConfig;
const config = {
  rootId: 'NCI-CTS-root',
  services: {
    ctsSearch,
  }
}
// ctsReactApp is initialize(config) (default export from @nciocpl/clinical-trials-search-app)
const initializeCTSApp = () => {
  ctsReactApp(config);
}

export default initializeCTSApp;
