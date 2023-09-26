/**
* Replace Spanish-character entities with literal values
* @param {string} editorContent the content to fix up.
*/
const fixSpanish = (editorContent) => {
  const cleaned = editorContent
    .replace('&Aacute;', 'Á')
    .replace('&aacute;','á')
    .replace('&Eacute;','É')
    .replace('&eacute;','é')
    .replace('&Iacute;','Í')
    .replace('&iacute;','í')
    .replace('&Oacute;','Ó')
    .replace('&oacute;','ó')
    .replace('&Uacute;','Ú')
    .replace('&uacute;','ú')
    .replace('&Yacute;','Ý')
    .replace('&yacute;','ý')
    .replace('&Ntilde;','Ñ')
    .replace('&ntilde;','ñ');
  return cleaned;
}

/**
 * Sanitizes characters converting to hex code for web calls.
 *
 * @param {string} c the character to sanitize
 * @returns The sanitized char.
 */
const sanitizeChar = (c) => {
  switch (c) {
    case "\n":  //line feed substitute
      return "&#x000a;";
    case "\r": //carriage return substitute
      return "&#x000d;";
    case "”":  //right double quote
      return "&#148;";
    case "—":  //em dash
      return "&#151;";
    case "–":  //en dash
      return "&#150;";
    case "Á":  //A accent - for some reason WS chokes on this
      return "&#193;";
    case "Í":  //I accent
      return "&#205;";
    default:
      return c;
  }
}

/**
 * All preexisting glossified links are expected to match the same pattern that
 * allows us to extract enough data to reconstruct them after a new glossification pass.
 * The API is already set up to ignore all tags but only the contents of a tags.
 * Since we use a span, we don't want the term to be findable and store it as a data attribute
 * rather than a text node.
 * We don't want to reglossify terms specifically because the terms
 * themselves may not match the glossary (because content editors can manually edit them
 * after a glossification pass and we need to preserve that alteration.)
 *
 * @param {string} match
 * @param {string} firstCaptureGroup
 *
 * @return {string}
 */
const wrapTermToSaveState = (match, firstCaptureGroup) => {
  const fullMatch = match;
  const termMatch = firstCaptureGroup;
  const extractDataTest = /(CDR[0-9]+).+language=([A-z]+)/i;
  const extractedData = fullMatch.match(extractDataTest);
  const id = extractedData[1];
  const language = extractedData[2];
  const wrappedTerm =
    `<span rel="glossified" data-id="${id}"
      data-language="${language}"
      data-term="${termMatch}"></span>`;
    return wrappedTerm;
}

/**
 * Before we can 'cache' the previously glossified terms during a request
 * we need to find them. Any glossified links that don't match this pattern
 * should be considered bad and handled with a manual content correction.
 *
 * @param {string} body
 *
 * @return {string}
 */
const removePreviouslyGlossifiedTerms = (body) => {
  const glossifiedTermTest = new RegExp("<a\\s+class=\"definition\".+?>(.+?)</a>", "g");
  const result = body.replace(glossifiedTermTest, wrapTermToSaveState);
    return result;
}

/**
 * Prepare the data for sending to glossifier service.
 *
 * @param {string} data the content
 */
export const prepareEditorBodyForGlossificationRequest = (data) => {
  // 1) Save previously glossified term state as an element that the API will
  // ignore.
  const tempData = removePreviouslyGlossifiedTerms(data);

  let sanitizedData = "";
  // 2) Sanitize the string one char at a time.
  for (let i = 0; i < tempData.length; i++) {
    sanitizedData += sanitizeChar(tempData.charAt(i));
  }
  sanitizedData = fixSpanish(sanitizedData);
  return sanitizedData;
}

/**
 * There are a few gotchas to determining the correct language to
 * specify in requests to the glossifier service.
 * When a new piece of spanish content is created directly, rather
 * than as a translation, the user has to select spanish from
 * a dropdown. However, this has no immediate effect on anything. Drupal
 * does not acknowledge this until the first save when an entity is being created
 * from the fields.
 * Because of this, first we need to check drupalSettings.path.currentPath and see if it starts
 * with "node/add" to determine if a new node is being created.
 * If a new node is being created we need to use javascript
 * to sniff the current state of the dropdown.
 *
 * If the user is not creating a new node, we can use the drupalSetting.path.currentLanguage
 * setting instead.
 *
 * However, it should be noted, a second edge case presents itself when adding a translation. It is possible
 * to add a translation using a route that does not include /espanol, which would
 * also lead to drupalSetting.path.currentLanguage showing 'en' for a spanish translation. We aren't
 * handling this at the moment. But it might be possible by sniffing the path again, this time to determine
 * if it uses "/translations/add/en/es" (until drupal changes the API of course.)
 *
 * @return {string}
 */
export const getContentLanguage = () => {
  const path = window.drupalSettings.path;
  const currentPath = path.currentPath;
  const testForAddNewContentPagePath = /^node\/add\/.+/i;
  const isAddNewContentPage = testForAddNewContentPagePath.test(currentPath);
  let language;
  if(isAddNewContentPage) {
    const languageSelectElement = document.getElementById('edit-langcode-0-value');
    language = languageSelectElement.value;
  }
  else {
    language = path.currentLanguage;
  }
  return language;
}
