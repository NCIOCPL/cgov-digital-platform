import * as suggestionDisplay from '../suggestion-display';

describe('glossifyTermFromLabel', () => {
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
  });

  it('creates an definition element with correct attributes for basic term', () => {
    testContainer.innerHTML = `<label data-gloss-lang="en" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="" data-preexisting="false">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<nci-definition data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles preexisting terms with HTML tags', () => {
    testContainer.innerHTML = `<label data-gloss-lang="en" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="%3Cem%3E%3Cstrong%3Ecancer%3C%2Fstrong%3E%3C%2Fem%3E%0A" data-preexisting="true">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<nci-definition data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en"><em><strong>cancer</strong></em>`
    + `\n</nci-definition>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles preexisting terms with HTML tags and single quotes', () => {
    testContainer.innerHTML = `<label data-gloss-lang="en" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="%3Cem%3E%3Cstrong%3E%27cancer%27%3C%2Fstrong%3E%3C%2Fem%3E%0A" data-preexisting="true">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<nci-definition data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en"><em><strong>'cancer'</strong></em>`
    + `\n</nci-definition>`;

    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles preexisting terms with HTML tags and double quotes', () => {
    testContainer.innerHTML = `<label data-gloss-lang="en" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="%3Cem%3E%3Cstrong%3E%22cancer%22%3C%2Fstrong%3E%3C%2Fem%3E" data-preexisting="true">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<nci-definition data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en"><em><strong>"cancer"</strong></em></nci-definition>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles Spanish language', () => {
    testContainer.innerHTML = `<label data-gloss-lang="es" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="" data-preexisting="false">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<nci-definition data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="es">cancer</nci-definition>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles empty HTML dataset', () => {
    testContainer.innerHTML = `<label data-gloss-lang="en" data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="" data-preexisting="true">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<nci-definition data-gloss-id="123" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  // Let's figure this one out. We can't just make up stuff, and also CKEditor will not like
  // the missing elements from our <nci-definition>. All attributes are required.
  // it('handles missing dataset properties gracefully', () => {
  //   testContainer.innerHTML = `<label >cancer</label>`;
  //   const mockLabel = testContainer.querySelector('label');

  //   suggestionDisplay.glossifyTermFromLabel(mockLabel);

  //   const expectedHtml = `<a data-glossary-id="CDR123" class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR123&amp;version=Patient&amp;language=undefined">cancer</a>`;
  //   expect(testContainer.innerHTML).toBe(expectedHtml);
  // });
});
