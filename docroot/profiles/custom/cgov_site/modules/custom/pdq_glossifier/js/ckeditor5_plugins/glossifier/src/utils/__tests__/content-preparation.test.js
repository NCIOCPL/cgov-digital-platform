// Unit tests for content-preparation.js
// These are "as-is" tests based in the original code.
import * as contentPrep from '../content-preparation';

describe('convertTagStringToHTML', () => {
  it('wraps text in single tag', () => {
    expect(contentPrep.convertTagStringToHTML('foo', 'strong')).toBe('<strong>foo</strong>');
  });
  it('wraps text in multiple tags', () => {
    // @todo What is up with the order of tags here? A stack?
    expect(contentPrep.convertTagStringToHTML('bar', 'em,strong')).toBe('<strong><em>bar</em></strong>');
  });
  it('returns text unchanged if tagString is empty', () => {
    expect(contentPrep.convertTagStringToHTML('baz', '')).toBe('baz');
  });
});

describe('prepareEditorBodyForGlossificationRequest', () => {
  it('sanitizes and fixes Spanish in input', () => {
    const input = 'Á\n&Eacute;';
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toContain('&#193;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toContain('&#x000a;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toContain('É');
  });

  it('replaces all supported Spanish HTML entities with literal characters', () => {
    const input = '&Aacute;&aacute;&Eacute;&eacute;&Iacute;&iacute;&Oacute;&oacute;&Uacute;&uacute;&Yacute;&yacute;&Ntilde;&ntilde;';
    const output = 'ÁáÉéÍíÓóÚúÝýÑñ';
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe(output);
  });

  it('returns input unchanged if no entities or special chars present', () => {
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('hello')).toBe('hello');
  });

  it('sanitizes special characters to hex codes', () => {
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('\n')).toBe('&#x000a;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('\r')).toBe('&#x000d;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('”')).toBe('&#148;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('—')).toBe('&#151;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('–')).toBe('&#150;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('Á')).toBe('&#193;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('Í')).toBe('&#205;');
  });

  it('returns character unchanged if not special', () => {
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('a')).toBe('a');
  });

  // @todo This test is technically an error if sanitization was expected to
  // encode unicode characters. Because we sanitize before fixing Spanish.
  // Will leave as is for now because that is how it has been "working" so far.
  it('handles mixed input with both entities and special chars', () => {
    const input = '&Aacute;\n—';
    // &Aacute; -> Á, then sanitized to &#193;, \n -> &#x000a;, — -> &#151;
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe('Á&#x000a;&#151;');
  });

  // @todo Figure what it up with the nested children in the definition tags.
  // We want to make sure that something like
  // `<strong>Test <em>with children</em></strong>`
  // is handled correctly.
  it('handles content with existing definition tags', () => {
    const input = `
      <p>Lorum ipsum dolor sit colon cancer, consectetur adipiscing elit.</p>
      <p>Lorem ipsum dolor sit amet, <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045360&amp;version=Patient&amp;language=en" data-glossary-id="CDR0000045360">Anemia</a> consectetur adipiscing elit.</p>
      <p>Lorem ipsum dolor sit amet, <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045360&amp;version=Patient&amp;language=en" data-glossary-id="CDR0000045360">Test <em>with<strong>children</strong></em></a> consectetur adipiscing elit.</p>
    `;
    const output = '&#x000a;      <p>Lorum ipsum dolor sit colon cancer, consectetur adipiscing elit.</p>&#x000a;      <p>Lorem ipsum dolor sit amet, <span rel=\"glossified\" data-id=\"CDR0000045360\"&#x000a;      data-language=\"en\"&#x000a;      data-preexisting=\"true\"&#x000a;      data-html=\"\"&#x000a;      data-term=\"Anemia\"></span> consectetur adipiscing elit.</p>&#x000a;      <p>Lorem ipsum dolor sit amet, <span rel=\"glossified\" data-id=\"CDR0000045360\"&#x000a;      data-language=\"en\"&#x000a;      data-preexisting=\"true\"&#x000a;      data-html=\"em,strong\"&#x000a;      data-term=\"Test withchildren\"></span> consectetur adipiscing elit.</p>&#x000a;    ';
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe(output);
  });

  // @todo The result of this test is a bit iffy. I would call it a bug, but it is also
  // original code. But I would not expect the data-term to be "undefined" if the
  // definition tag is empty.
  it('handles content with empty definition tags', () => {
    const input = `
      <p>Lorem ipsum dolor sit amet, <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045360&amp;version=Patient&amp;language=en" data-glossary-id="CDR0000045360"> </a> consectetur adipiscing elit.</p>
    `;
    const output = '&#x000a;      <p>Lorem ipsum dolor sit amet, <span rel=\"glossified\" data-id=\"CDR0000045360\"&#x000a;      data-language=\"en\"&#x000a;      data-preexisting=\"true\"&#x000a;      data-html=\"\"&#x000a;      data-term=\"undefined\"></span> consectetur adipiscing elit.</p>&#x000a;    ';
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe(output);
  });

  // @todo Make this test case work in the future. Right now the logic requires
  // the HTML to be in a very specific order. Order should not matter in processing
  // the definition links.
  it('handles content with out of order definition link tags', () => {
    const input = `<a href="/Common/PopUps/popDefinition.aspx?id=CDR0000045360&amp;version=Patient&amp;language=en" class="definition" data-glossary-id="CDR0000045360">Anemia</a>`;
    const output = '<a href=\"/Common/PopUps/popDefinition.aspx?id=CDR0000045360&amp;version=Patient&amp;language=en\" class=\"definition\" data-glossary-id=\"CDR0000045360\">Anemia</a>';
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe(output);
  });

});

describe('getContentLanguage', () => {
  beforeEach(() => {
    global.window = Object.create(window);
    window.drupalSettings = {
      path: {
        currentPath: '',
        currentLanguage: 'en',
      },
    };
  });
  it('returns language from dropdown if on add new content page', () => {
    window.drupalSettings.path.currentPath = 'node/add/article';
    const fakeSelect = { value: 'es' };
    document.getElementById = jest.fn().mockReturnValue(fakeSelect);
    expect(contentPrep.getContentLanguage()).toBe('es');
  });
  it('returns currentLanguage if not on add new content page', () => {
    window.drupalSettings.path.currentPath = 'node/123';
    expect(contentPrep.getContentLanguage()).toBe('en');
  });
});
