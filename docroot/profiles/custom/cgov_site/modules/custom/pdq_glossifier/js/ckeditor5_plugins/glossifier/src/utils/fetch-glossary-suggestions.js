/**
 * Fetches the glossary suggestions.
 *
 * This is more of a helper than anything else given the amount of
 * promises we are dealing with.
 *
 * @param {string} content The content to get suggestions for.
 * @param {string} language The two language character code.
 */
const fetchGlossarySuggestions = async (content, language) => {

  // @todo We should pass these items in as configured from the Drupal editor.
  // The glossify button should maybe control which dictionary. Also
  // possible is allowing the user to choose which one. For not, we just
  // hard code here. We want the results to have the dictionary, which
  // it does, but also the audience, which it does not.
  const glossDictionary = "Cancer.gov";
  const glossAudience = "Patient";

  // Get the CSRF Token
  let csrfToken = null;
  try {
    // We must retrieve the necessary csrf token to make an authenticated
    // request to the api.
    const res = await fetch(Drupal.url('session/token'));
    if (res.status !== 200) {
      throw new Error(`CSRF request responded with status ${res.status}`);
    }
    csrfToken = await res.text();

  } catch (err) {
    console.error(err);
    throw new CsrfException(err.message);
  }

  // Now fetch the suggestions.
  try {
    const res = await fetch(Drupal.url('pdq/api/glossifier'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        'fragment': content,
        'languages': [
          language,
        ],
        'dictionaries': [
          glossDictionary
        ],
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Glossification request responded with status ${res.status}`);
    }

    const suggestions = await res.json();
    // Fake the audience until the API returns it. This will make the
    // suggestions easier if we can pull this from the response.
    // (Also in the future we may need to support multiple audiences.)
    return suggestions.map((suggestion) => ({...suggestion, audience: glossAudience}));

  } catch (err) {
    console.error(err);
    throw new GlossifierApiException(err.message);
  }
}

export default fetchGlossarySuggestions;
