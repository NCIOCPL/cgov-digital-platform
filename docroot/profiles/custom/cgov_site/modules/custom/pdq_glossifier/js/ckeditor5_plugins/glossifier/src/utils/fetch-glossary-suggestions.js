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
          'Cancer.gov'
        ],
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Glossification request responded with status ${res.status}`);
    }

    const suggestions = await res.json();
    return suggestions;

  } catch (err) {
    console.error(err);
    throw new GlossifierApiException(err.message);
  }
}

export default fetchGlossarySuggestions;
