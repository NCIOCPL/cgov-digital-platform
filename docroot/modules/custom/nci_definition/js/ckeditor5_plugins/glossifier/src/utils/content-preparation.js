/**
 * Sanitizes characters converting to hex code for web calls.
 *
 * @param {string} c the character to sanitize
 * @returns The sanitized char.
 */
const sanitizeChar = (c) => {
  switch (c) {
    // Technically the DOMParser automatically strips newlines on their
    // own, so this case is only hit when the newlines are between
    // some nodes. (This includes carriage returns.)
    case "\n":  //line feed substitute
      return "&#x000a;";
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
 * Wraps a string in set of html tags that surrounded it before glossification
 *
 * @param {string} termText
 * @param {string} tagString
 * @returns {string}
 */
export const convertTagStringToHTML = (termText, termHTML) => {
  let displayText = termText;
  // If we have termHTML tags, we need to wrap the originalText in them
  if(termHTML && termHTML !== "") {
    const tags = termHTML.split(',');
    let textWithHTML = termText;
    if(tags.length > 0) {
      let openingTag = '';
      let closingTag = '';
      for (let i = 0; i < tags.length; i++) {
        openingTag = '<' + tags[i] + '>';
        closingTag = '</' + tags[i] + '>';
        textWithHTML = openingTag + textWithHTML + closingTag;
      }
      displayText = textWithHTML;
    }
  }
  return displayText;
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
  // Bring this into a DOM so we can find elements and replace them.
  const parser = new window.DOMParser();
  const contentDom = parser.parseFromString(body, 'text/html');

  const definitions = contentDom.body.querySelectorAll('nci-definition');

  // We need to change each definition to a `<span rel="glossified">`
  for (const definition of definitions) {

    const replacementSpan = document.createElement('span');
    replacementSpan.setAttribute('rel', 'glossified');
    replacementSpan.dataset.preexisting = "true";
    // Copy over the <nci-definition> attributes for the glossified term.
    replacementSpan.dataset.glossLang = definition.dataset.glossLang;
    replacementSpan.dataset.glossId = definition.dataset.glossId;
    replacementSpan.dataset.glossDictionary = definition.dataset.glossDictionary;
    replacementSpan.dataset.glossAudience = definition.dataset.glossAudience;

    /*
     * We need to flatten the children into a single text string. This is not
     * actually needed when sending to the API, but needed to properly display
     * the checkbox. The assumption here is under normal circumstances people
     * do not do crazy child elements. (e.g., if you have a dictionary link around
     * an image, things will go wrong here)
     *
     * There is one existing bug that we will not fix until a future ticket - handling:
     * <nci-def><strong>Some Text <em>a sibling to the text node of strong</em></strong>
     * The above gets converted to:
     * <nci-def><em><strong>Some Text a sibling to the text node of strong</strong></em>
     */
    // We use getElementsByTagName so we can get a list for nested tag. (Hence the
    // above bug)
    const childArray = Array.from(definition.getElementsByTagName('*'));
    const childTagList = childArray.map(element => element.tagName.toLowerCase());
    const childTags = childTagList.join(',');
    const childTextContents = definition.textContent;

    // Now set the properties to hold the tags list and contents.
    replacementSpan.dataset.html = childTags;
    replacementSpan.dataset.term = childTextContents;

    // Ok, now we swap.
    definition.replaceWith(replacementSpan);
  }

  const newHtml = contentDom.body.innerHTML;

  return newHtml;
}

/**
 * Prepare the data for sending to glossifier service.
 *
 * @param {string} data the content
 */
export const prepareEditorBodyForGlossificationRequest = (data) => {
  // 1) Save previously glossified term state as an element that the API will
  // ignore.
  // NOTE: This will replace HTML Entities with the unicode chars.
  // This actually happens when content is loaded into CKEditor 5.
  const tempData = removePreviouslyGlossifiedTerms(data);

  let sanitizedData = "";
  // 2) Sanitize the string one char at a time.
  for (let i = 0; i < tempData.length; i++) {
    sanitizedData += sanitizeChar(tempData.charAt(i));
  }
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
