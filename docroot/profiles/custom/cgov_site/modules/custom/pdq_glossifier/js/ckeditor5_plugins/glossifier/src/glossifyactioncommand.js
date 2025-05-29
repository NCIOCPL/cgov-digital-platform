/**
 * @file defines GlossifyActionCommand, which is executed when the glossify
 * toolbar button is pressed.
 */

import { Command } from 'ckeditor5/src/core';
import processSelectedSuggestions from './utils/process-selected-suggestions';
import prepareAndFetchSuggestions from './utils/prepare-and-fetch-suggestions';

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
    // I would rather clone the modal contents, but there is not a great way while
    // preserving the checkbox state. (I tried to DOMParser.parseFromString the
    // modalContents.innerHTML, but checkboxes got unchecked.)
    const newHtml = processSelectedSuggestions(this.modalContents);

    this.editor.data.set(newHtml);

    this.modalInstance.close();
  }


  /**
   * THE MAIN EXECUTE COMMAND.
   *
   * This is the "controller" for the dialog.
   */
  execute() {
    const editor = this.editor;

    this._setModalContentsToSpinner();

    // Begin the fetch chain.
    prepareAndFetchSuggestions(editor.data.get())
      .then((suggestionsHtml) => {
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

    // Show the dialog. Note: this shows the spinner the first time until
    // the fetch completes.
    this.modalInstance.showModal();
  }
}
