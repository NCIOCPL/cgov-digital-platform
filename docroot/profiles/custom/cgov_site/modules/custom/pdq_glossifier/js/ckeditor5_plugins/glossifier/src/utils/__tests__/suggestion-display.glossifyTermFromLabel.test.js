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

  it('creates an anchor element with correct attributes for basic term', () => {
    testContainer.innerHTML = `<label data-term-id="CDR123" data-language="en" data-html="" data-preexisting="false">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<a data-glossary-id="CDR123" class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR123&amp;version=Patient&amp;language=en">cancer</a>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles preexisting terms with HTML tags', () => {
    testContainer.innerHTML = `<label data-term-id="CDR123" data-language="en" data-html="strong,em" data-preexisting="true">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<a data-glossary-id="CDR123" class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR123&amp;version=Patient&amp;language=en"><em><strong>cancer</strong></em></a>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles Spanish language', () => {
    testContainer.innerHTML = `<label data-term-id="CDR123" data-language="es" data-html="" data-preexisting="false">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<a data-glossary-id="CDR123" class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR123&amp;version=Patient&amp;language=es">cancer</a>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles empty HTML dataset', () => {
    testContainer.innerHTML = `<label data-term-id="CDR123" data-language="en" data-html="" data-preexisting="true">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<a data-glossary-id="CDR123" class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR123&amp;version=Patient&amp;language=en">cancer</a>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });

  it('handles missing dataset properties gracefully', () => {
    testContainer.innerHTML = `<label data-term-id="CDR123">cancer</label>`;
    const mockLabel = testContainer.querySelector('label');

    suggestionDisplay.glossifyTermFromLabel(mockLabel);

    const expectedHtml = `<a data-glossary-id="CDR123" class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR123&amp;version=Patient&amp;language=undefined">cancer</a>`;
    expect(testContainer.innerHTML).toBe(expectedHtml);
  });
});
