/***
 * @file
 * Sets app config for initialization.
 */

import initialize from '@nciocpl/glossary-app';
import { getCanonicalURL, getDocumentLanguage, getMetaData, parseUrl } from 'Utilities';

const instanceConfig = window.glossaryAppSettings;

const metaTags = getMetaData([
  ['name', 'dcterms.subject'],
  ['name', 'dcterms.issued'],
  ['property', 'og:site_name']
], document);


const language = getDocumentLanguage(document);

const canonicalHref = parseUrl(getCanonicalURL(document), document);
if (!canonicalHref) {
  throw new Error("GlossaryApp cannot be loaded - canonical URL not found");
}

const canonicalHost = canonicalHref.protocol + "//" + canonicalHref.host;

let pathName = null;
if(canonicalHref.pathname) {
  pathName = (canonicalHref.pathname.charAt(0) === "/") ? canonicalHref.pathname : "/" + canonicalHref.pathname;
}

const alternateLangLink = document.querySelector('link[rel="alternate"]:not([hreflang="' + language + '"])');
const alternateLangHref = alternateLangLink ? parseUrl(alternateLangLink.href, document) : null;

let altLanguageDictionaryBasePath = undefined;
if(alternateLangHref) {
  altLanguageDictionaryBasePath = (alternateLangHref.pathname.charAt(0) === "/") ? alternateLangHref.pathname : "/" + alternateLangHref.pathname;
}

const drupalConfig = {
  baseHost: window.location.protocol + "//" + window.location.hostname,
  basePath: pathName ? pathName :
  canonicalHost,
  altLanguageDictionaryBasePath,
  analyticsChannel: metaTags['dcterms.subject'],
  analyticsPublishedDate: metaTags['dcterms.issued'],
  rootId: "NCI-glossary-root",
  dictionaryEndpoint: window.CDEConfig.glossaryConfig.apiServer,
  languageToggleSelector: "#LangList1 a",
  language,
  siteName: metaTags['og:site_name'],
}

const config = {
  ...instanceConfig,
  ...drupalConfig
}

// React Helmet is removing all elements with data-react-helmet="true" on the page except the ones it directly controls. This is a big
// issue. This code adds it only to the elements we want to control manually to avoid that issue.
const elementSelectors = [
  ["name", "description"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"]
];

const elementsUsedByGlossary = elementSelectors.map(el => {
  // phpcs:ignore
  return document.querySelector(`meta[${el[0]}="${el[1]}"]`);
});
// title tag is updated by Glossary app so want to prevent duplication here, too
elementsUsedByGlossary.push(document.querySelector('title'));

// Add the canonical url
elementsUsedByGlossary.push(document.querySelector('link[rel="canonical"]'));

elementsUsedByGlossary.forEach(el => {
  // Some elements are originated by react-helmet after this script runs and will be null
  if (el) {
    el.setAttribute("data-react-helmet", "true");
  }
});

const initializeGlossaryApp = () => {
  initialize(config);
};

export default initializeGlossaryApp;
