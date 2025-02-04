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
  const id = label.dataset.termId;
  const language = label.dataset.language;
  const paramString = id + "&version=Patient&language=" + language;
  const href = "/Common/PopUps/popDefinition.aspx?id=" + paramString;

  const anchor = document.createElement('a');
  // The glossary popups shim on the FE will use this ID to generate a click handler
  // that works with the current paradigm.
  anchor.dataset.glossaryId = id;
  anchor.className = 'definition';
  anchor.href = href;
  anchor.textContent = originalText;

  label.replaceWith(anchor);
};

/**
 * Create element to wrap term for checkbox selection.
 *
 * @param {string} termText
 * @param {string} termId
 * @param {string} termLanguage
 * @param {boolean} isFirstOccurenceOfTerm
 *
 * @returns {string}
 */
const createGlossificationTermOptionElementString = (termText, termId, termLanguage, isFirstOccurenceOfTerm) => {
  // Create element to wrap term for checkbox selection
  // IE Add in inputs now with all the rest of the attributes as data attributes.
  // Then when I strip the checkboxes I can build the anchor tag.
  // This is because, even on percussion now, clicking the links causes you to be
  // directed to an error page. That would avoid the issue.
  const firstOccurenceClassName = isFirstOccurenceOfTerm ? "glossify-dialog__term--first" : "";
  const classlist = "glossify-dialog__term " + firstOccurenceClassName
  const wrappedTerm =
    `<label
       data-term-id="${termId}"
       data-language="${termLanguage}"
       class="${classlist}"
       data-glossify-label
    >${termText}<input type="checkbox"/></label>`;
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
export const createDialogBodyHtml = (originalHtml, candidateTermConfigs, language) => {
  // Instead of editing the string contents, we create a new string. This
  // allows us to do the whole concatenation in one pass. The slow pointer
  // keeps the new, longer string in sync with the indexes of the original string.
  // (Which is important as long as the api uses indexes and length to identify terms).
  let processedHtml = "";
  let slowPointer = 0;
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
    const termId = termConfig.doc_id;
    const isFirstOccurenceOfTerm = termConfig.first_occurrence;
    const wrappedTerm = createGlossificationTermOptionElementString(termText, termId, language, isFirstOccurenceOfTerm)
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
 * @param {string} language
 */
export const createHtmlFromSuggestions = (preparedBody, responseArray, language) => {
  // TODO: Confirm whether getting the langcode from the editor instance is sufficient.
  // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#property-langCode
  const dialogBody = createDialogBodyHtml(preparedBody, responseArray, language);

  // Create an element with the contents of the suggestions.
  const contentsEl = document.createElement('div');
  contentsEl.insertAdjacentHTML('afterbegin', dialogBody);

  // We used a simple span with a rel=glossified attribute to "remember" which terms
  // were previously glossified. We need to first set the input to 'checked' to reflect its
  // previously selected state and then remove the span tag.
  const previouslyGlossifiedTerms = contentsEl.querySelectorAll("span[rel='glossified']");
  previouslyGlossifiedTerms.forEach(function (span) {
    const termText = span.dataset.term;
    const termId = span.dataset.id;
    const termLanguage = span.dataset.language;
    const labelString = createGlossificationTermOptionElementString(termText, termId, termLanguage);
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
