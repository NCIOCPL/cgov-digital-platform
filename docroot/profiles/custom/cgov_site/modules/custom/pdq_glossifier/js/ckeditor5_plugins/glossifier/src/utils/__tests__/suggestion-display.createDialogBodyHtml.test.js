import * as suggestionDisplay from '../suggestion-display';

describe('createDialogBodyHtml', () => {

  it('creates dialog body HTML with term checkboxes', () => {
    const mockCandidateTermConfigs = [
      {
        start: 10,
        length: 6,
        doc_id: "CDR123",
        language: "en",
        first_occurrence: true,
        dictionary: "Cancer.gov"
      },
      {
        start: 22,
        length: 7,
        doc_id: 'CDR456',
        first_occurrence: false
      }
    ];

    const originalHtml = 'This is a cancer test example text';
    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, mockCandidateTermConfigs, 'en');

    const expected = `This is a <label
       data-term-id="CDR123"
       data-language="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label> test <label
       data-term-id="CDR456"
       data-language="en"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >example<input type="checkbox"/></label> text`;

    expect(result).toBe(expected);
  });

  it('handles empty candidate terms array', () => {
    const originalHtml = 'This is a test';
    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, [], 'en');

    expect(result).toBe('This is a test');
  });

  it('handles candidates with with HTML tags', () => {
    const originalHtml = 'This is a <strong><em>cancer</em></strong> test';
    const candidateTerms = [{
      start: 22,
      length: 6,
      doc_id: 'CDR123',
      first_occurrence: true
    }];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `This is a <strong><em><label
       data-term-id="CDR123"
       data-language="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label></em></strong> test`;

    expect(result).toBe(expected);
  });

  it('handles existing glossified terms with HTML tags', () => {
    const originalHtml = '<p>This is a <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045333&amp;version=Patient&amp;language=en" data-glossary-id="CDR0000045333"><em><strong>cancer</strong></em></a> test</p>';
    const candidateTerms = [];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = '<p>This is a <a class=\"definition\" href=\"/Common/PopUps/popDefinition.aspx?id=CDR0000045333&amp;version=Patient&amp;language=en\" data-glossary-id=\"CDR0000045333\"><em><strong>cancer</strong></em></a> test</p>';

    expect(result).toBe(expected);
  });

  it('preserves text before and after terms', () => {
    const originalHtml = 'Start cancer middle example end';
    const candidateTerms = [
      { start: 6, length: 6, doc_id: 'CDR123', first_occurrence: true },  // "cancer" starts at position 6
      { start: 20, length: 7, doc_id: 'CDR456', first_occurrence: false } // "example" starts at position 20
    ];
    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `Start <label
       data-term-id="CDR123"
       data-language="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label> middle <label
       data-term-id="CDR456"
       data-language="en"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >example<input type="checkbox"/></label> end`;

    expect(result).toBe(expected);
  });

  it('handles overlapping term positions correctly', () => {
    const originalHtml = 'cancer treatment';
    const candidateTerms = [
      { start: 0, length: 6, doc_id: 'CDR123', first_occurrence: true },
      { start: 7, length: 9, doc_id: 'CDR456', first_occurrence: false }
    ];

    const result = suggestionDisplay.createDialogBodyHtml(originalHtml, candidateTerms, 'en');
    const expected = `<label
       data-term-id="CDR123"
       data-language="en"
       class="glossify-dialog__term glossify-dialog__term--first"
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >cancer<input type="checkbox"/></label> <label
       data-term-id="CDR456"
       data-language="en"
       class="glossify-dialog__term "
       data-preexisting="false"
       data-html=""
       data-glossify-label
    >treatment<input type="checkbox"/></label>`;

    expect(result).toBe(expected);
  });

  it('handles empty original HTML', () => {
    const result = suggestionDisplay.createDialogBodyHtml('', [], 'en');
    expect(result).toBe('');
  });
});
