/**
 * @file defines GlossifyActionCommand, which is executed when the glossify
 * toolbar button is pressed.
 */

import { Command } from 'ckeditor5/src/core';
import {
  prepareEditorBodyForGlossificationRequest,
  getContentLanguage
} from './utils/content-preparation';

import { createHtmlFromSuggestions, glossifyTermFromLabel } from './utils/suggestion-display';

/**
 * Exception class for CSRF Exceptions.
 */
class CsrfException extends Error {}

/**
 * Exception class for Glossifier Exceptions.
 */
class GlossifierApiException extends Error {}

/**
 * Class definition for the Glossify Action Command that will display the
 * possible glossification options and handle the users selection.
 *
 * NOTE: There is an instance for each editor on the page.
 */
export default class GlossifyActionCommand extends Command {
  constructor ( editor ) {
    super( editor );

    // The wrapper around the glossary contents. This is actually
    // to support the old CSS.
    const modalWrapper = document.createElement('div');
    modalWrapper.classList.add('cke_dialog_body');

    const modalInnerWrap = document.createElement('div');
    modalInnerWrap.classList.add('glossify-dialog-container');
    modalWrapper.appendChild(modalInnerWrap);

    // An area to the modal contents.
    this.modalContents = document.createElement('div');

    // An area to stick buttons.
    this.buttonContents = document.createElement('div')
    this.buttonContents.classList.add('glossify-dialog-buttons');

    // Stick the contents and the buttons into the dialog.
    modalInnerWrap.appendChild(this.modalContents);
    modalInnerWrap.appendChild(this.buttonContents);

    this.modalInstance = Drupal.dialog(modalWrapper, {
      modal: true,
      dialogClass: 'cgov_reset_all', // This is here to support old css.
      title: Drupal.t('Glossify Page'),
      closeOnEscape: true,
      width: '75%',
    });
  }

  /**
   * Hacky method to reposition our modal after content changes occur.
   * Technically the modal listens to resize events to do the right
   * thing, so we are just cheating and doing that.
   * Since we can get to jQuery from here, we can't get to the dialog
   * to do it that way.
   */
  _repositionModal() {
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * This sets the modal contents to the loading spinner.
   */
  _setModalContentsToSpinner() {
    this.modalContents.replaceChildren();
    this.buttonContents.replaceChildren();
    this.modalContents.insertAdjacentHTML(
      'afterbegin',
      `<div class="glossify-dialog__spinner-outer"><div class="glossify-dialog__spinner-inner"></div></div>`
    );

    this._repositionModal();
  }

  /**
   * This sets the modal contents to an error message & cancel.
   */
  _setModalContentsToError(errorMessage) {
    this.modalContents.replaceChildren();
    this.buttonContents.replaceChildren()
    this.modalContents.insertAdjacentHTML(
      'afterbegin',
      `<p class="glossify-dialog__error">${errorMessage}</p>`
    );
    // TODO: ok/cancel button
    this._repositionModal();
  }

  /**
   * Sets the modal contents to the glossary suggestion form.
   * @param {HTMLElement} contents the html of the suggestions
   */
  _setModalContentsToSuggestions(contents) {
    this.modalContents.replaceChildren();
    this.modalContents.appendChild(contents);
    this.buttonContents.replaceChildren();

    const saveBtn = document.createElement('button')
    saveBtn.classList.add('button', 'button--primary');
    saveBtn.addEventListener('click', this._updateEditorWithSelections.bind(this));
    saveBtn.innerText = Drupal.t('Save');

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('button');
    cancelBtn.innerText = Drupal.t('Cancel');
    cancelBtn.addEventListener('click', () => { this.modalInstance.close(); })

    this.buttonContents.appendChild(saveBtn);
    this.buttonContents.appendChild(cancelBtn);

    this._repositionModal();
  }

  /**
   * Ok button handler to update editor content with selections.
   */
  _updateEditorWithSelections() {
    const labels = this.modalContents.querySelectorAll('label[data-glossify-label]');
    for (const label of labels) {
      const checkbox = label.querySelector('input');
      const isSelected = checkbox.checked;
      if(!isSelected) {
        // Restore the term as basic text. No glossification.
        const originalText = label.textContent;
        label.replaceWith(originalText);
      }
      else {
        glossifyTermFromLabel(label);
      }
    }
    const newHtml = this.modalContents.innerHTML;
    this.editor.data.set(newHtml);

    this.modalInstance.close();
  }

  /**
   * Fetches the glossary suggestions.
   *
   * This is more of a helper than anything else given the amount of
   * promises we are dealing with.
   *
   * @param {string} content The content to get suggestions for.
   * @param {string} language The two language character code.
   */
  async _fetchGlossarySuggestions(content, language) {
    // Get the CSRF Token
    let csrfToken = null;
    try {
      // We must retrieve the necessary csrf token to make an authenticated
      // request to the api.
      const res = await fetch(Drupal.url('session/token'));
      if (res.status !== 200) {
        throw new Error(`CSRF request responded with status ${res.status}`);
      }
      csrfToken = await res.text();

    } catch (err) {
      console.error(err);
      throw new CsrfException(err.message);
    }

    // Now fetch the suggestions.
    try {
      const res = await fetch(Drupal.url('pdq/api/glossifier'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          'fragment': content,
          'languages': [
            language,
          ],
          'dictionaries': [
            'Cancer.gov'
          ],
        }),
      });

      if (res.status !== 200) {
        throw new Error(`Glossification request responded with status ${res.status}`);
      }

      const suggestions = await res.json();
      return suggestions;

    } catch (err) {
      console.error(err);
      throw new GlossifierApiException(err.message);
    }
  }

  /**
   * THE MAIN EXECUTE COMMAND.
   *
   * This is the "controller" for the dialog.
   */
  execute() {
    const editor = this.editor;

    this._setModalContentsToSpinner();

    const preparedBody = prepareEditorBodyForGlossificationRequest(editor.data.get());
    const language = getContentLanguage();

    // Begin the fetch chain.
    this._fetchGlossarySuggestions(preparedBody, language)
      .then((suggestions) => {
        const suggestionsHtml = createHtmlFromSuggestions(preparedBody, suggestions, language)
        // Render the options.
        this._setModalContentsToSuggestions(suggestionsHtml);
      })
      .catch((err) => {
        // Display error.
        if (err instanceof CsrfException) {
          this._setModalContentsToError(`Unable to retrieve session token: ${err.message}`);
        } else {
          this._setModalContentsToError(`Glossifier request failed: ${err.message}`);
        }
      })

    // Show the dialog.
    this.modalInstance.showModal();
  }
}
