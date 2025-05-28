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
      doc_id: 'CDR123',
      first_occurrence: true
    }];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `This is <label
       data-term-id="CDR123"
       data-language="en"
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
      doc_id: 'CDR123',
      first_occurrence: false
    }];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `This is <label
       data-term-id="CDR123"
       data-language="en"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label>`;

    expect(result).toBe(expected);
  });

  it('handles preexisting terms with HTML tags', () => {
    const preparedBody = '<span rel="glossified" data-term="cancer" data-html="strong,em" data-id="CDR123" data-language="en">cancer</span>';
    const responseArray = [];
    const language = 'en';

    const result = suggestionDisplay.createHtmlFromSuggestions(preparedBody, responseArray, language);
    const expectedHtml = `<label data-term-id="CDR123" data-language="en" class="glossify-dialog__term " data-preexisting="true" data-html="strong,em" data-glossify-label="">cancer<input type="checkbox"></label>`;

    expect(result.innerHTML).toContain(expectedHtml);
  });
});

// Edge cases and error handling
describe('Edge cases and error handling', () => {

  it('handles null/undefined values in createDialogBodyHtml', () => {
    const originalHtml = 'test content';
    const candidateTerms = [
      { start: 0, length: 4, doc_id: null, first_occurrence: undefined }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `<label
       data-term-id="null"
       data-language="en"
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
      { start: 0, length: 6, doc_id: 'CDR123', first_occurrence: true }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `<label
       data-term-id="CDR123"
       data-language="en"
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
      { start: 8, length: 6, doc_id: 'CDR123', first_occurrence: true }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `This is <label
       data-term-id="CDR123"
       data-language="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label>`;

    expect(result).toBe(expected);

  });

  it('handles adjacent terms', () => {
    const originalHtml = 'cancertumor';
    const candidateTerms = [
      { start: 0, length: 6, doc_id: 'CDR123', first_occurrence: true },
      { start: 6, length: 5, doc_id: 'CDR456', first_occurrence: false }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `<label
       data-term-id="CDR123"
       data-language="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label><label
       data-term-id="CDR456"
       data-language="en"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >tumor<input type="checkbox"/></label>`;
    expect(result).toBe(expected);

  });
});
