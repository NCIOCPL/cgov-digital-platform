// Unit tests for content-preparation.js
// These are "as-is" tests based in the original code.
import * as contentPrep from '../content-preparation';

describe('convertTagStringToHTML', () => {
  it('wraps text in single tag', () => {
    expect(contentPrep.convertTagStringToHTML('foo', 'strong')).toBe('<strong>foo</strong>');
  });
  it('wraps text in multiple tags', () => {
    // @bug The whole wrapping and unwrapping tags is a bug.
    expect(contentPrep.convertTagStringToHTML('bar', 'em,strong')).toBe('<strong><em>bar</em></strong>');
  });
  it('returns text unchanged if tagString is empty', () => {
    expect(contentPrep.convertTagStringToHTML('baz', '')).toBe('baz');
  });
});

describe('prepareEditorBodyForGlossificationRequest', () => {
  // Note, this is a weird test. Previously this test took in html entities and
  // needed the "fixSpanish" to translate (some) to unicode chars. With our new
  // approach we use DOMParser, which replaces the entities. However, in
  // reviewing CKEditor 5, it replaces the entities for us. So there is pretty
  // much no way any entities are passing through.
  it('sanitizes and fixes Spanish in input', () => {
    const input = 'Á\n&Eacute;';
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe('&#193;&#x000a;É');
  });

  it('replaces all supported Spanish HTML entities with literal characters', () => {
    const input = '&Aacute;&aacute;&Eacute;&eacute;&Iacute;&iacute;&Oacute;&oacute;&Uacute;&uacute;&Yacute;&yacute;&Ntilde;&ntilde;';
    const output = '&#193;áÉé&#205;íÓóÚúÝýÑñ';
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe(output);
  });

  it('returns input unchanged if no entities or special chars present', () => {
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('hello')).toBe('hello');
  });

  it('sanitizes special characters to hex codes', () => {
    // Technically the DOMParser automatically strips newlines on its own.
    // putting the newlines between elements gets it to do the right thing.
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('<p>a</p>\n<p>b</p>')).toBe('<p>a</p>&#x000a;<p>b</p>');
    // We used to have to replace \r with &#x000d;. DOMParser replaces
    // \r with \n. Keeping this test to flag any future changes.
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('<p>a</p>\r<p>b</p>')).toBe('<p>a</p>&#x000a;<p>b</p>');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('”')).toBe('&#148;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('—')).toBe('&#151;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('–')).toBe('&#150;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('Á')).toBe('&#193;');
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('Í')).toBe('&#205;');
  });

  it('returns character unchanged if not special', () => {
    expect(contentPrep.prepareEditorBodyForGlossificationRequest('a')).toBe('a');
  });

  // This test now works as expected with the changes to content-preparation from
  // prior to <nci-definition> handling. Previous translating HTML entities came
  // after sanitization which encoded certain spanish unicode chars. Also, in
  // retrospect, our new DOMParser AND even CKEditor always encodes html entities.
  // Anyway, we are keeping this test here, for any future changes as the expected
  // output below is, well, expected.
  it('handles mixed input with both entities and special chars', () => {
    const input = '&Aacute;\n—';
    // &Aacute; -> Á, then sanitized to &#193;, \n -> &#x000a;, — -> &#151;
    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe('&#193;&#x000a;&#151;');
  });

  // @todo Figure what it up with the nested children in the definition tags.
  // We want to make sure that something like
  // `<strong>Test <em>with children</em></strong>`
  // is handled correctly.
  it('handles content with existing definition tags', () => {
    const input =
      `<p>Lorum ipsum dolor sit colon cancer, consectetur adipiscing elit.</p>` +
      `<p>Lorem ipsum dolor sit amet, <nci-definition data-gloss-id="4536" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">Anemia</nci-definition> consectetur adipiscing elit.</p>` +
      `<p>Lorem ipsum dolor sit amet, <nci-definition data-gloss-id="45360" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">Test <em>with<strong>children</strong></em></nci-definition> consectetur adipiscing elit.</p>`;

    const output =
      `<p>Lorum ipsum dolor sit colon cancer, consectetur adipiscing elit.</p>` +
      `<p>Lorem ipsum dolor sit amet, <span rel="glossified" data-preexisting="true" data-gloss-lang="en" data-gloss-id="4536" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="" data-term="Anemia"></span> consectetur adipiscing elit.</p>` +
      `<p>Lorem ipsum dolor sit amet, <span rel="glossified" data-preexisting="true" data-gloss-lang="en" data-gloss-id="45360" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="em,strong" data-term="Test withchildren"></span> consectetur adipiscing elit.</p>`;

    expect(contentPrep.prepareEditorBodyForGlossificationRequest(input)).toBe(output);
  });

  // This test works slightly differently than previously. It maintains the empty
  // space. Previously it just did "undefined", which was not exactly the expected
  // response.
  it('handles content with empty definition tags', () => {
    const input = `<p>Lorem ipsum dolor sit amet, <nci-definition data-gloss-id="45360" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en"> </nci-definition> consectetur adipiscing elit.</p>`;
    const output = `<p>Lorem ipsum dolor sit amet, <span rel="glossified" data-preexisting="true" data-gloss-lang="en" data-gloss-id="45360" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-html="" data-term=" "></span> consectetur adipiscing elit.</p>`;
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
