import {
  prepareEditorBodyForGlossificationRequest,
  getContentLanguage
} from './content-preparation';

import fetchGlossarySuggestions from './fetch-glossary-suggestions';

import { createHtmlFromSuggestions } from './suggestion-display';

/**
 * This function prepares the editor content for the network request
 * and returns the HTML for the dialog containing checkboxes.
 * @param {string} editorData The editor content to prepare and fetch suggestions for.
 * @returns {Promise<HTMLElement>} The HTML string containing the suggestions with checkboxes.
 * @throws {CsrfException} If there is an error fetching the CSRF token.
 * @throws {GlossifierApiException} If there is an error fetching the glossary suggestions.
 */
const prepareAndFetchSuggestions = async (editorData) => {
  const preparedBody = prepareEditorBodyForGlossificationRequest(editorData);
  const language = getContentLanguage();

  // Technically the fetch hardcodes the dictionary right now. We should pass
  // in the dictionary to be used, as well as the audience in a future
  // update.
  const suggestions = await fetchGlossarySuggestions(preparedBody, language);

  const suggestionsHtml = createHtmlFromSuggestions(preparedBody, suggestions);

  return suggestionsHtml;
}

export default prepareAndFetchSuggestions;
