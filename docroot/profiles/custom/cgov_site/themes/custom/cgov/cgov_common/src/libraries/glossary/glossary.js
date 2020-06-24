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

const alternateLangLink = document.querySelector('link[rel="alternate"]:not([hreflang="' + language + '"])');
const alternateLangHref = alternateLangLink ? parseUrl(alternateLangLink.href, document) : null;
const altLanguageDictionaryBasePath = alternateLangHref ? alternateLangHref.pathname : undefined;

const drupalConfig = {
  baseHost: window.location.protocol + "//" + window.location.hostname,
  basePath: canonicalHref ? canonicalHref.pathname :
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

export default initializeGlossaryApp;
