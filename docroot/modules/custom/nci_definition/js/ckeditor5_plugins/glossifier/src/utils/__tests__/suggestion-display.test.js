// Unit tests for suggestion-display.js
import * as suggestionDisplay from '../suggestion-display';

// Tests for the non-exported function createGlossificationTermOptionElementString
// We test this indirectly through createDialogBodyHtml since it's used there
describe('createGlossificationTermOptionElementString (tested indirectly)', () => {

  it('creates checkbox element string with first occurrence class', () => {
    const originalHtml = 'This is cancer';
    const candidateTerms = [{
      start: 8,
      length: 6,
      doc_id: 'CDR0000000123',
      language: 'en',
      first_occurrence: true,
      dictionary: 'Cancer.gov',
      audience: 'Patient',
    }];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `This is <label
       data-gloss-id="123"
       data-gloss-dictionary="Cancer.gov"
       data-gloss-audience="Patient"
       data-gloss-lang="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label>`;

    expect(result).toBe(expected);
  });

  it('creates checkbox element string without first occurrence class', () => {
    const originalHtml = 'This is cancer';
    const candidateTerms = [{
      start: 8,
      length: 6,
      doc_id: 'CDR0000000123',
      language: 'en',
      first_occurrence: false,
      dictionary: 'Cancer.gov',
      audience: 'Patient'
    }];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `This is <label
       data-gloss-id="123"
       data-gloss-dictionary="Cancer.gov"
       data-gloss-audience="Patient"
       data-gloss-lang="en"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label>`;

    expect(result).toBe(expected);
  });

  it('handles preexisting terms with HTML tags', () => {
    const preparedBody = '<span rel="glossified" data-term="cancer" data-html="%3Cem%3E%3Cstrong%3Ecancer%3C%2Fstrong%3E%3C%2Fem%3E" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</span>';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `<label data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="%3Cem%3E%3Cstrong%3Ecancer%3C%2Fstrong%3E%3C%2Fem%3E" data-glossify-label="">cancer<input type="checkbox"></label>`;

    expect(result.innerHTML).toContain(expectedHtml);
  });

  it('handles preexisting terms with HTML tags and single quotes', () => {
    const preparedBody = '<span rel="glossified" data-term="cancer" data-html="%3Cem%3E%3Cstrong%3E%27cancer%27%3C%2Fstrong%3E%3C%2Fem%3E%0A" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</span>';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `<label data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="%3Cem%3E%3Cstrong%3E%27cancer%27%3C%2Fstrong%3E%3C%2Fem%3E%0A" data-glossify-label="">cancer<input type="checkbox"></label>`;

    expect(result.innerHTML).toContain(expectedHtml);
  });

  it('handles preexisting terms with HTML tags and double quotes', () => {
    const preparedBody = '<span rel="glossified" data-term="cancer" data-html="%3Cstrong%3E%3Cem%3E%22cancer%22%3C%2Fem%3E%3C%2Fstrong%3E" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</span>';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `<label data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="true" data-html="%3Cstrong%3E%3Cem%3E%22cancer%22%3C%2Fem%3E%3C%2Fstrong%3E" data-glossify-label="">cancer<input type="checkbox"></label>`;

    expect(result.innerHTML).toContain(expectedHtml);
  });
});

// Edge cases and error handling
describe('Edge cases and error handling', () => {

  // @todo This should actually be something it throws on.
  it('handles null/undefined values in createDialogBodyHtml', () => {
    const originalHtml = 'test content';
    const candidateTerms = [
      { start: 0, length: 4, doc_id: null, first_occurrence: undefined }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `<label
       data-gloss-id="NaN"
       data-gloss-dictionary="undefined"
       data-gloss-audience="undefined"
       data-gloss-lang="undefined"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >test<input type="checkbox"/></label> content`;

    expect(result).toBe(expected);
  });

  it('handles terms at the beginning of text', () => {
    const originalHtml = 'cancer is a disease';
    const candidateTerms = [
      { start: 0, length: 6, doc_id: 'CDR0000000123', language: 'en', first_occurrence: true, dictionary: 'Cancer.gov', audience: 'Patient' }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `<label
       data-gloss-id="123"
       data-gloss-dictionary="Cancer.gov"
       data-gloss-audience="Patient"
       data-gloss-lang="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label> is a disease`;

    expect(result).toBe(expected);
  });

  it('handles terms at the end of text', () => {
    const originalHtml = 'This is cancer';
    const candidateTerms = [
      { start: 8, length: 6, doc_id: 'CDR0000000123', language: 'en', first_occurrence: true, dictionary: 'Cancer.gov', audience: 'Patient' }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `This is <label
       data-gloss-id="123"
       data-gloss-dictionary="Cancer.gov"
       data-gloss-audience="Patient"
       data-gloss-lang="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label>`;

    expect(result).toBe(expected);

  });

  // Technically, per the API rules this would actually be a single term, and
  // probably not match anything. I.E. terms can't really abut up to each other.
  it('handles adjacent terms', () => {
    const originalHtml = 'cancertumor';
    const candidateTerms = [
      { start: 0, length: 6, doc_id: 'CDR0000000123', language: 'en', first_occurrence: true, dictionary: 'Cancer.gov', audience: 'Patient' },
      { start: 6, length: 5, doc_id: 'CDR0000000456', language: 'en', first_occurrence: false, dictionary: 'Cancer.gov', audience: 'Patient' }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `<label
       data-gloss-id="123"
       data-gloss-dictionary="Cancer.gov"
       data-gloss-audience="Patient"
       data-gloss-lang="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label><label
       data-gloss-id="456"
       data-gloss-dictionary="Cancer.gov"
       data-gloss-audience="Patient"
       data-gloss-lang="en"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >tumor<input type="checkbox"/></label>`;
    expect(result).toBe(expected);

  });
});
