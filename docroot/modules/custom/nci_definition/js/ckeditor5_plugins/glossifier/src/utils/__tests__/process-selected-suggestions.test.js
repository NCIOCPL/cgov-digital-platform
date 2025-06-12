import processSelectedSuggestions from '../process-selected-suggestions';

describe('processSelectedSuggestions', () => {
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

  describe('when checkbox is checked (selected)', () => {
    it('should convert selected terms to glossary links', () => {
      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `<div>` +
          `<p>Just as ` +
          `<label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox" checked></label>` +
          ` affects your physical health, it can bring up a wide range of feelings you’re not used to dealing with. It can also make&nbsp;existing&nbsp;feelings seem more intense. They may change daily, hourly, or even minute to minute. This is true whether you’re currently in treatment, done with treatment, or a friend or family member. These feelings are ` +
          `<label data-gloss-id="44362" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">all<input type="checkbox"></label> normal.</p>` +
          `<p>Often the values you grew up with affect how you think about and&nbsp;` +
          `<label data-gloss-id="454700" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cope<input type="checkbox"></label>` +
          ` with ` +
          `<label data-gloss-id="45333" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label>. For example some people:</p><ul><li>Feel they have to be strong and protect their friends and families</li><li>Seek support and turn to loved ones or other ` +
          `<label data-gloss-id="45333" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> ` +
          `<label data-gloss-id="450125" data-language="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">survivors<input type="checkbox"></label>` +
          `</li><li>Ask for help from counselors or other professionals</li><li>Turn to their faith to help them ` +
          `<label data-term-id="454700" data-language="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cope<input type="checkbox"></label>` +
          `</li></ul>` +
          `<p>Whatever you decide, it's important to do what's right for you and not to compare yourself with others. Your friends and family members may share some of the same feelings. If you feel comfortable, share this information with them.</p>` +
          `</div>`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `<div>` +
        `<p>Just as ` +
        `<nci-definition data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition>` +
        ` affects your physical health, it can bring up a wide range of feelings you’re not used to dealing with. It can also make&nbsp;existing&nbsp;feelings seem more intense. They may change daily, hourly, or even minute to minute. This is true whether you’re currently in treatment, done with treatment, or a friend or family member. These feelings are all normal.</p>` +
        `<p>Often the values you grew up with affect how you think about and&nbsp;cope with cancer. For example some people:</p><ul><li>Feel they have to be strong and protect their friends and families</li><li>Seek support and turn to loved ones or other cancer survivors</li><li>Ask for help from counselors or other professionals</li><li>Turn to their faith to help them cope</li></ul>` +
        `<p>Whatever you decide, it's important to do what's right for you and not to compare yourself with others. Your friends and family members may share some of the same feelings. If you feel comfortable, share this information with them.</p></div>`;

      expect(actual).toBe(expected);
    });

    it('should maintain preexisting term', () => {

      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="true" data-html="" data-glossify-label="">cancer<input type="checkbox" checked></label> Placeholder`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `Placeholder <nci-definition data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition> Placeholder`;

      expect(actual).toBe(expected);

    });

    it('should restore html tags', () => {

      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="true" data-html="strong,em" data-glossify-label="">cancer<input type="checkbox" checked></label> Placeholder`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `Placeholder <nci-definition data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en"><em><strong>cancer</strong></em></nci-definition> Placeholder`;

      expect(actual).toBe(expected);

    });

    it('should process multiple selected terms', () => {
      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox" checked></label> Placeholder` +
        `<label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox" checked></label> Placeholder`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `Placeholder <nci-definition data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition> Placeholder` +
        `<nci-definition data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition> Placeholder`;

      expect(actual).toBe(expected);
    });
  });

  describe('when checkbox is unchecked (not selected)', () => {
    it('should restore unselected term as basic text for non-preexisting term', () => {
      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> Placeholder`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `Placeholder cancer Placeholder`;

      expect(actual).toBe(expected);

    });

    it('should remove preexisting term', () => {

      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="true" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> Placeholder`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `Placeholder cancer Placeholder`;

      expect(actual).toBe(expected);

    });

    it('should remove preexisting term and restore HTML', () => {

      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="true" data-html="strong,em" data-glossify-label="">cancer<input type="checkbox"></label> Placeholder`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `Placeholder <em><strong>cancer</strong></em> Placeholder`;

      expect(actual).toBe(expected);

    });
  });

  describe('mixed selected and unselected terms', () => {
    it('should process both selected and unselected terms correctly', () => {
      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString(
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox" checked></label> Placeholder` +
        `<label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term " data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox" checked></label> Placeholder` +
        `Placeholder <label data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" class="glossify-dialog__term glossify-dialog__term--first" data-preexisting="false" data-html="" data-glossify-label="">cancer<input type="checkbox"></label> Placeholder`,
        'text/html'
      );

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = `Placeholder ` +
        `<nci-definition data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition> Placeholder` +
        `<nci-definition data-gloss-id="45333" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">cancer</nci-definition> Placeholder` +
         `Placeholder cancer Placeholder`;

      expect(actual).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should handle empty dialog contents', () => {
      const parser = new window.DOMParser();
      const contentDoc = parser.parseFromString('','text/html');

      const actual = processSelectedSuggestions(contentDoc.body);
      const expected = '';

      expect(actual).toBe(expected);


    });

    it('should handle labels with missing data attributes', () => {
      testContainer.innerHTML = `
        <div class="dialog-contents">
          <label data-glossify-label>
            cancer
            <input type="checkbox">
          </label>
        </div>
      `;

      const dialogContents = testContainer.querySelector('.dialog-contents');
      processSelectedSuggestions(dialogContents);

      // Should treat missing preexisting as false and process as non-preexisting
      expect(dialogContents.innerHTML.trim()).toBe('cancer');
    });

    it('should handle terms with special characters', () => {
      testContainer.innerHTML = `
        <div class="dialog-contents">
          <label data-glossify-label data-preexisting="false" data-html="">
            café & résumé
            <input type="checkbox">
          </label>
        </div>
      `;

      const dialogContents = testContainer.querySelector('.dialog-contents');
      processSelectedSuggestions(dialogContents);

      expect(dialogContents.innerHTML.trim()).toBe('café &amp; résumé');
    });
  });

  // @todo: should handle labels without checkboxes. (fails now)

});
