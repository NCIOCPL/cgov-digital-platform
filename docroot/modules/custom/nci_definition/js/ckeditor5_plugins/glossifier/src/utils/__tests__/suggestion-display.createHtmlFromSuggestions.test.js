import * as suggestionDisplay from '../suggestion-display';

describe('createHtmlFromSuggestions', () => {
  let testContainer;

  beforeEach(() => {
    // Create a real DOM container for testing
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    // Clean up DOM after each test
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('creates HTML element and processes suggestions', () => {
    const preparedBody = 'test body';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expected = `<div>test body</div>`;
    expect(result.outerHTML).toBe(expected);
  });

  it('processes previously glossified terms correctly', () => {
    const preparedBody = '<span rel="glossified" data-term="cancer" data-html="strong" data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</span>';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `<label data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="strong" data-glossify-label="">cancer<input type="checkbox"></label>`;

    expect(result.innerHTML).toContain(expectedHtml);
  });

  it('handles multiple previously glossified terms', () => {
    const preparedBody = `
      <span rel="glossified" data-term="cancer" data-html="strong" data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</span>
      <span rel="glossified" data-term="tumor" data-html="em" data-gloss-id="999" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="es">tumor</span>
    `;
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `
      <label data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="strong" data-glossify-label="">cancer<input type="checkbox"></label>
      <label data-gloss-id="999" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="es" class="glossify-dialog__term " data-preexisting="true" data-html="em" data-glossify-label="">tumor<input type="checkbox"></label>
    `;
    expect(result.innerHTML).toContain(expectedHtml);
  });

  it('handles terms with no HTML tags', () => {
    const preparedBody = '<span rel="glossified" data-term="cancer" data-html="" data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</span>';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `<label data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="" data-glossify-label="">cancer<input type="checkbox"></label>`;

    expect(result.innerHTML).toContain(expectedHtml);
  });

  it('handles terms with HTML tags in previously glossified spans', () => {
    const preparedBody = '<span rel="glossified" data-term="cancer" data-html="strong,em" data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</span>';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `<label data-gloss-id="789" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="strong,em" data-glossify-label="">cancer<input type="checkbox"></label>`;

    expect(result.innerHTML).toContain(expectedHtml);
  });
});
