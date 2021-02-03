/***
 * @file
 * Sets app config for initialization.
 */

const initialize = () => {
  throw new Error("This has been removed for due to issue #3003");
};

import {
  getCanonicalURL,
  getDocumentLanguage,
  getMetaData,
  parseUrl
} from "Utilities";

const instanceConfig = window.sitewideSearchAppSettings;

const metaTags = getMetaData(
  [
    ["name", "dcterms.subject"],
    ["name", "dcterms.isPartOf"],
    ["name", "dcterms.issued"],
    ["property", "og:site_name"],
    ["property", "og:title"]
  ],
  document
);

const language = getDocumentLanguage(document);

const canonicalHref = parseUrl(getCanonicalURL(document), document);
if (!canonicalHref) {
  throw new Error(
    "SitewideSearchApp cannot be loaded - canonical URL not found"
  );
}

const canonicalHost = canonicalHref.protocol + "//" + canonicalHref.host;

let pathName = null;
if (canonicalHref.pathname) {
  pathName =
    canonicalHref.pathname.charAt(0) === "/"
      ? canonicalHref.pathname
      : "/" + canonicalHref.pathname;
}

// If the dictionary path, name, and audience are set, pass in the dictionary URL,
// name, audience, and Glossary API endpoint.
const validateAndGetDictionaryConfig = (
  dictionaryPath,
  dictionaryName,
  dictionaryAudience
) => {
  if (dictionaryPath || dictionaryName || dictionaryAudience) {
    if (!dictionaryPath) {
      console.error("dictionaryPath is not set in app module config.");
    }

    if (!dictionaryName) {
      console.error("dictionaryName is not set in app module config.");
    }

    if (!dictionaryAudience) {
      console.error("dictionaryAudience is not set in app module config.");
    }

    if (!window.CDEConfig.glossaryConfig.apiServer) {
      console.error("Glossary API Server is not set in CDEConfig.");
    }

    if (dictionaryPath && dictionaryName && dictionaryAudience) {
      return {
        dictionaryUrl: canonicalHost + dictionaryPath,
        dictionaryName,
        dictionaryAudience,
        glossaryEndpoint: window.CDEConfig.glossaryConfig.apiServer
      };
    }
  }
};

// If the Best Bets collection is set, pass in it and the Best Bets API endpoint.
const validateAndGetBestBetsConfig = bestbetsCollection => {
  if (bestbetsCollection) {
    if (!window.CDEConfig.sitewideSearchConfig.bestBetsApiServer) {
      console.error("Best Bets API Server is not set in CDEConfig.");
    }

    return {
      bestbetsCollection,
      bestbetsEndpoint: window.CDEConfig.sitewideSearchConfig.bestBetsApiServer
    };
  }
};

const drupalConfig = {
  analyticsChannel: metaTags["dcterms.subject"],
  analyticsContentGroup: metaTags["dcterms.isPartOf"],
  analyticsPublishedDate: metaTags["dcterms.issued"],
  apiBaseEndpoint: window.CDEConfig.general.apiServer,
  baseHost: window.location.protocol + "//" + window.location.hostname,
  basePath: pathName ? pathName : canonicalHref,
  rootId: "NCI-app-root",
  searchEndpoint: window.CDEConfig.sitewideSearchConfig.searchApiServer,
  language,
  siteName: metaTags["og:site_name"],
  title: metaTags["og:title"]
};

const config = {
  ...instanceConfig,
  ...drupalConfig,
  ...validateAndGetDictionaryConfig(
    instanceConfig.dictionaryPath,
    instanceConfig.dictionaryName,
    instanceConfig.dictionaryAudience
  ),
  ...validateAndGetBestBetsConfig(instanceConfig.bestbetsCollection)
};

// This is a temporary fix for removing the breadcrumb element that displays on Spanish and microsite search results
// pages. REMOVE THIS when the sitewide fix for the breadcrumbs is implemented!
let breadcrumbs = document.querySelector(".breadcrumbs");
if (breadcrumbs !== null && breadcrumbs.parentNode) {
  breadcrumbs.parentNode.removeChild(breadcrumbs);
}

const initializeSitewideSearchApp = () => {
  initialize(config);
};

export default initializeSitewideSearchApp;
