import { convertTagStringToHTML } from './content-preparation.js';
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
      // Restore the term as basic text. No glossification.
     const termHTML = label.dataset.html;
     const isPreexisting = label.dataset.preexisting;
     const originalText = label.textContent;
      if (isPreexisting === "true") {
        let displayText = convertTagStringToHTML(originalText, termHTML);
        const tempDoc = document.createElement('div');
        tempDoc.innerHTML = displayText;
        label.replaceWith(...tempDoc.childNodes);
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
