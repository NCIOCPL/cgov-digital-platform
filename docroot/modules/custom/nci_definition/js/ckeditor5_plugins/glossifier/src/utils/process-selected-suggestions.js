import { glossifyTermFromLabel } from './suggestion-display.js';

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
      const termHTML = decodeURI(label.dataset.html);
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(termHTML, 'text/html');
      const fragment = doc.body;
      const isPreexisting = label.dataset.preexisting;
      const originalText = label.textContent;
      if (isPreexisting === "true") {
       label.replaceWith(fragment);
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
