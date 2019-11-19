import { ClinicalTrialsServiceFactory } from '@nciocpl/clinical-trials-search-client.js'
import initialize from '@nciocpl/clinical-trials-search-app';

//assumes import { ClinicalTrialsServiceFactory } from '@nciocpl/clinical-trials-search-client.js' is good to go
const ctsSearch = () => {
  const hostName = window.CDEConfig.ctsConfig.apiServer;
  const service = ClinicalTrialsServiceFactory.create(hostName);
  return service;
};

// React Helmet is removing all elements with data-react-helmet="true" on the page except the ones it directly controls. This is a big
// issue. This code adds it only to the elements we want to control manually to avoid that issue.
const elementSelectors = [
  ["name", "description"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"]
];

const elementsUsedByCTS = elementSelectors.map(el => {
  return document.querySelector(`meta[${el[0]}="${el[1]}"]`);
});
// title tag is updated by CTS app so want to prevent duplication here, too
elementsUsedByCTS.push(document.querySelector('title'));

elementsUsedByCTS.forEach(el => {
  // Some elements are originated by react-helmet after this script runs and will be null
  if (el) {
    el.setAttribute("data-react-helmet", "true");
  }
});

// this will probably be changed to pull from window config
// ex. const config = window.nciCTSConfig;
const config = {
  rootId: 'NCI-CTS-root',
  services: {
    ctsSearch,
  },
  printCacheEndpoint: window.CDEConfig.ctsConfig.printCacheEndpoint
}
// ctsReactApp is initialize(config) (default export from @nciocpl/clinical-trials-search-app)
const initializeCTSApp = () => {
  initialize(config);
}

export default initializeCTSApp;
