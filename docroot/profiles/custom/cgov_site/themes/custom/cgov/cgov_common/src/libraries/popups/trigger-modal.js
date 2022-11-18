import NCIModal from 'Core/libraries/modal';

let modal = null;

/**
 * Triggers a Modal popup, ensuring that only a single Modal is happening
 * at a time.
 * @param {string} content The content
 * @param {Function} postinit a callback function to trigger any event wireups once it has been added to the DOM.
 */
const triggerModal = (content, postinit = () => {}) => {

  if (modal === null) {
    modal = new NCIModal();
  }

  modal.setContent(content);
  modal.showModal();

  postinit();
}

export default triggerModal;
