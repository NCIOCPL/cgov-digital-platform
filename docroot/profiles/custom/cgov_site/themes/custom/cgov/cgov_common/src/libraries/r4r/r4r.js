/***
 * @file
 * Sets app config for initialization.
 */

import initializeR4R from "@nciocpl/r4r-app";
import createEventHandler from "./eventHandler";
import { cancerGovAnalyticsHandler } from "./analyticsHandler";
import { exitDisclaimerEventHandler } from "./exitDisclaimerHandler";
import {
  dispatchTrackingEvent,
  EVENT_TYPES
} from "Core/libraries/analytics/dumb-datalayer";

import { getCanonicalURL, getMetaData, parseUrl } from "Utilities";

const instanceConfig = window.R4RAppSettings;

const metaTags = getMetaData(
  [
    ["name", "dcterms.subject"],
    ["name", "dcterms.issued"],
    ["property", "og:site_name"]
  ],
  document
);

// React Helmet is removing all elements with data-react-helmet="true" on the page except the ones it directly controls. This is a big
// issue. This code adds it only to the elements we want to control manually to avoid that issue.
const elementSelectors = [
  ["name", "description"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"]
];
const elementsUsedByR4R = elementSelectors.map(el => {
  return document.querySelector(`meta[${el[0]}="${el[1]}"]`);
});
elementsUsedByR4R.forEach(el => {
  // Some elements are originated by react-helmet after this script runs and will be null
  if (el) {
    el.setAttribute("data-react-helmet", "true");
  }
});

const canonicalHref = parseUrl(getCanonicalURL(document), document);
if (!canonicalHref) {
  throw new Error("R4R App cannot be loaded - canonical URL not found");
}

const canonicalHost = canonicalHref.protocol + "//" + canonicalHref.host;
let pathName = null;
if (canonicalHref.pathname) {
  pathName =
    canonicalHref.pathname.charAt(0) === "/"
      ? canonicalHref.pathname
      : "/" + canonicalHref.pathname;
}

// set up event handling and analytics
const eventHandler = createEventHandler();
eventHandler.subscribe(exitDisclaimerEventHandler);
eventHandler.subscribe(cancerGovAnalyticsHandler);

const r4rTheme = {
  "r4r-container": "row",
  searchbar__container: "cancer-gov",
  "searchbar__button--submit": "button",
  browse__tile: "arrow-link",
  "similar-resource__tile": "arrow-link"
};

const drupalConfig = {
  apiEndpoint: window.CDEConfig.r4rConfig.apiServer,
  baseHost: window.location.protocol + "//" + window.location.hostname,
  basePath: pathName ? pathName : canonicalHost,
  customTheme: r4rTheme,
  eventHandler: eventHandler.onEvent,
  historyProps: {
    basename: canonicalHref ? canonicalHref.pathname : canonicalHost
  },
  rootId: "NCI-R4R-root"
};

const config = {
  ...drupalConfig,
  ...instanceConfig
};

const initializeR4RApp = () => {
  // Fire off page load do this before React mucks with our page.
  // The common content load items will be applied here,
  // pulled from metadata. So data can be an empty object.
  dispatchTrackingEvent(EVENT_TYPES.Load, {});
  initializeR4R(config);
};

export default initializeR4RApp;
