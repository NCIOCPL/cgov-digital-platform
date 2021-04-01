import { ClinicalTrialsServiceFactory } from "@nciocpl/clinical-trials-search-client.js";
// import { trackCTSEvent } from './cts-analytics';
import initialize from "@nciocpl/clinical-trials-search-app";
import { getCanonicalURL, getMetaData, parseUrl } from "Utilities";

const metaTags = getMetaData(
  [
    ["name", "dcterms.subject"],
    ["name", "dcterms.issued"],
    ["name", "dcterms.isPartOf"],
    ["property", "og:site_name"]
  ],
  document
);

const canonicalHref = parseUrl(getCanonicalURL(document), document);
if (!canonicalHref) {
  throw new Error("CTSApp cannot be loaded - canonical URL not found");
}
const canonicalHost = canonicalHref.protocol + "//" + canonicalHref.host;

// this will probably be changed to pull from window config
// ex. const config = window.nciCTSConfig;
const drupalConfig = {
  analyticsChannel: metaTags["dcterms.subject"],
  analyticsPublishedDate: metaTags["dcterms.issued"],
  analyticsContentGroup: metaTags["dcterms.isPartOf"],
  baseHost: window.location.protocol + "//" + window.location.hostname,
  basePath: canonicalHref ? canonicalHref.pathname : canonicalHost,
  rootId: "NCI-CTS-root"
};

const instanceConfig = {
  printCacheEndpoint: window.CDEConfig.ctsConfig.printCacheEndpoint,
  ctsHostname: window.CDEConfig.ctsConfig.ctsHostname
};

// mash the configs together for initialization
const config = {
  ...instanceConfig,
  ...drupalConfig
};

// React Helmet is removing all elements with data-react-helmet="true" on the page except the ones it directly controls. This is a big
// issue. This code adds it only to the elements we want to control manually to avoid that issue.
const elementSelectors = [
  ["name", "description"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"]
];
// Mark elements which will be used by helmet
const elementsUsedByCTS = elementSelectors.map(el => {
  return document.querySelector(`meta[${el[0]}="${el[1]}"]`);
});

// title tag is updated by CTS app so want to prevent duplication here, too
elementsUsedByCTS.push(document.querySelector("title"));

// Add the canonical url
elementsUsedByCTS.push(document.querySelector('link[rel="canonical"]'));

elementsUsedByCTS.forEach(el => {
  // Some elements are originated by react-helmet after this script runs and will be null
  if (el) {
    el.setAttribute("data-react-helmet", "true");
  }
});

// ctsReactApp is initialize(config) (default export from @nciocpl/clinical-trials-search-app)
const initializeCTSApp = () => {
  initialize(config);
};

export default initializeCTSApp;
