import { glossifyTermFromLabel, decodeHTML} from './suggestion-display.js';

/**
 * Process the contents of the dialog to generate html for the
 * editor.
 * @param {HTMLElement} dialogContents the dialog element containing the suggestions.
 */
const processSelectedSuggestions = (dialogContents) => {
  const labels = dialogContents.querySelectorAll('label[data-glossify-label]');
  for (const label of labels) {
    const checkbox = label.querySelector('input');
    const isSelected = checkbox.checked;
    if(!isSelected) {
      // Restore the term as basic formatted text. No glossification.
      const isPreexisting = label.dataset.preexisting;
      const originalText = label.textContent;
      let decodedHTML = decodeHTML(label.dataset.html, originalText);
      if (isPreexisting === "true") {
        if ((decodedHTML instanceof HTMLElement || decodedHTML instanceof NodeList)
                  && decodedHTML.childNodes.length > 0) {
          label.replaceWith(...decodedHTML.childNodes);
        } else {
        label.replaceWith(originalText);
        }
      } else {
        label.replaceWith(originalText);
      }
    }
    else {
      glossifyTermFromLabel(label);
    }
  }
  const newHtml = dialogContents.innerHTML;
  return newHtml;
};

export default processSelectedSuggestions;
