import { convertTagStringToHTML } from './content-preparation';

/**
 * Create a glossified term HTML element.
 *
 * Future revisions to change the form of these links (for modal purposes
 * possibly) should look to change this logic.
 *
 * @param {*} label
 */
export const glossifyTermFromLabel = (label) => {
  const originalText = label.textContent;
  const termHTML = label.dataset.html;
  const isPreexisting = label.dataset.preexisting;
  let displayText = originalText;
  //If term was selected before and has html tags wrapping it, convert it from string to html wrapped in those tags
  if((isPreexisting === "true") && termHTML && (termHTML!=='')) {
    displayText = convertTagStringToHTML(originalText, termHTML);
  }

  const definition = document.createElement('nci-definition');
  definition.dataset.glossId = label.dataset.glossId;
  definition.dataset.glossDictionary = label.dataset.glossDictionary;
  definition.dataset.glossAudience = label.dataset.glossAudience;
  definition.dataset.glossLang = label.dataset.glossLang;

  // Why don't we get HTML from convertTagStringToHTML?
  // It might be nicer to appendChild.
  definition.innerHTML = displayText;
  label.replaceWith(definition);
};

/**
 * Create element to wrap term for checkbox selection.
 *
 * @param {string} termText
 * @param {string} glossId the id of the definition
 * @param {string} glossDictionary the dictionary name
 * @param {string} glossAudience the audience of the definition
 * @param {string} glossLang the language of the definition
 * @param {string} termHTML
 * @param {boolean} isFirstOccurenceOfTerm
 * @param {boolean} isPreexisting
 *
 * @returns {string}
 */
const createGlossificationTermOptionElementString = (
  termText,
  glossId,
  glossDictionary,
  glossAudience,
  glossLang,
  termHTML,
  isFirstOccurenceOfTerm,
  isPreexisting
) => {
  // Create element to wrap term for checkbox selection
  // IE Add in inputs now with all the rest of the attributes as data attributes.
  // Then when I strip the checkboxes I can build the anchor tag.
  // This is because, even on percussion now, clicking the links causes you to be
  // directed to an error page. That would avoid the issue.

  const firstOccurenceClassName = isFirstOccurenceOfTerm ? "glossify-dialog__term--first" : "";
  const classlist = "glossify-dialog__term " + firstOccurenceClassName;
  let textWithHTML = termText;

  //If term was selected before and has html tags wrapping it, convert it from string to html wrapped in those tags
  // The following code is inert because isPreexisting is never a string.
  // also given how nested elements can get complicated, do we really
  // want to see the styling on the text in the label.
  if((isPreexisting === "true") && termHTML && (termHTML!=='')) {
    textWithHTML = convertTagStringToHTML(termText, termHTML);
  }

  const wrappedTerm =
    `<label
       data-gloss-id="${glossId}"
       data-gloss-dictionary="${glossDictionary}"
       data-gloss-audience="${glossAudience}"
       data-gloss-lang="${glossLang}"
       class="${classlist}"
       data-preexisting="${isPreexisting}"
       data-html="${termHTML}"
       data-glossify-label
    >${textWithHTML}<input type="checkbox"/></label>`;
  return wrappedTerm;
};

/**
 * Given an array of objects containing configuration data
 * for a glossary term and a string containing the original HTML (after
 * being processed for sending to the API), we want to generate checkboxes
 * allowing a user to select the terms they want to be 'glossified' (i.e be
 * wrapper in an anchor tag pointing at the glossary term).
 *
 * @param {string} originalHtml
 * @param {Object[]} candidateTermConfigs
 *
 * @returns {string}
 */
export const createDialogBodyHtml = (originalHtml, candidateTermConfigs) => {
  // Instead of editing the string contents, we create a new string. This
  // allows us to do the whole concatenation in one pass. The slow pointer
  // keeps the new, longer string in sync with the indexes of the original string.
  // (Which is important as long as the api uses indexes and length to identify terms).
  let processedHtml = "";
  let slowPointer = 0;
  //Get all of the glossified terms in the originalHtml
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(originalHtml, 'text/html');
  const elements = doc.querySelectorAll("span[rel='glossified']");
  for(let i = 0; i < candidateTermConfigs.length; i++){
    const termConfig = candidateTermConfigs[i];
    const termStartIndex = termConfig.start;
    const termLength = termConfig.length;
    const termEndIndex = termStartIndex + termLength;
    const preceedingSnippet = originalHtml.slice(slowPointer, termStartIndex);
    processedHtml += preceedingSnippet;
    slowPointer = termStartIndex;
    const termText = originalHtml.slice(slowPointer, termEndIndex);
    slowPointer = termEndIndex;
    // The glossary id is CDR000012345. We need this to be just 12345.
    const glossId = termConfig.doc_id ? parseInt(termConfig.doc_id?.slice(3)) : NaN;
    const glossDictionary = termConfig.dictionary;
    const glossAudience = termConfig.audience;
    const glossLang = termConfig.language;
    // Lookup termText in set of span placeholders for existing glossary term, set html property from that if present
    let termHTML = '';
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].dataset.term === termText){
        termHTML = elements[i].dataset.html;
      }
    }
    const isFirstOccurenceOfTerm = termConfig.first_occurrence;
    const wrappedTerm = createGlossificationTermOptionElementString(
      termText, glossId, glossDictionary, glossAudience, glossLang,
      termHTML, isFirstOccurenceOfTerm, false
    );
    processedHtml += wrappedTerm;
  }
  // We need to grab the tail of the originalHtml
  const tailSnippet = originalHtml.slice(slowPointer);
  processedHtml += tailSnippet;
  return processedHtml;
}

/**
 * The API returns a list of objects that couple strongly to the
 * prepared body of the editor sent in the request. The first thing we
 * need to do is reconcile the two parts (createDialogBodyHtml)
 * before any other operations are performed which might disrupt the fragile indexing.
 *
 * The second task will be restoring previously glossified terms in such a way
 * that are selectable inputs just like new terms, but already in a checked state.
 *
 * The first task is a string operation, the second will require acting on DOM
 * elements. To that end between the two phases we will update the dialog body with the
 * processed html string to generate the necessary elements to manuipulate further.
 *
 * @param {string} preparedBody
 * @param {Object[]} responseArray
 */
export const createHtmlFromSuggestions = (
  preparedBody,
  responseArray,
) => {
  // TODO: Confirm whether getting the langcode from the editor instance is sufficient.
  // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#property-langCode
  // This todo should probably get moved to where ever this is called from.
  const dialogBody = createDialogBodyHtml(preparedBody, responseArray);

  // Create an element with the contents of the suggestions.
  const contentsEl = document.createElement('div');
  contentsEl.insertAdjacentHTML('afterbegin', dialogBody);

  // We used a simple span with a rel=glossified attribute to "remember" which terms
  // were previously glossified. We need to first set the input to 'checked' to reflect its
  // previously selected state and then remove the span tag.
  const previouslyGlossifiedTerms = contentsEl.querySelectorAll("span[rel='glossified']");
  previouslyGlossifiedTerms.forEach(function (span) {
    const termText = span.dataset.term;
    const termHTML = span.dataset.html;
    const glossId = span.dataset.glossId;
    const glossDictionary = span.dataset.glossDictionary;
    const glossAudience = span.dataset.glossAudience;
    const glossLang = span.dataset.glossLang;
    const labelString = createGlossificationTermOptionElementString(
      termText, glossId, glossDictionary, glossAudience, glossLang,
      termHTML, false, true
    );
    // Because we have a string instead of a DOM element to work with, we're going to use a little
    // trickery here to get a DOM element by first inserting the string and then reextracting it
    // as an element (which lets us programmatically check the input and use the replaceWith method.)
    span.innerHTML = labelString;
    const labelTag = span.querySelector('label');
    const inputTag = labelTag.querySelector('input');
    inputTag.checked = true;
    span.replaceWith(labelTag);
  });

  return contentsEl;
}
