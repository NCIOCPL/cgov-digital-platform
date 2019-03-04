/* inspiration: https://github.com/ghosh/micromodal/blob/master/src/index.js */
import { throttle } from 'throttle-debounce';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'; // works on iOS as well

// elements that can have focus (tabbable) inside the modal
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])'
];

export default class Modal{
  constructor({
    //options
    targetModal = 'modal-1',
    modal = true,
    disableScroll = true,
    onCreate = () => {},
    onShow = () => {},
    onClose = () => {},
    openTrigger = 'data-modal-open',
    closeTrigger = 'data-modal-close',
    awaitCloseAnimation = true,
    content = `<div class="spinkit spinner"><div class="dot1"></div><div class="dot2"></div></div>`
  } = {}) {
    this.initialized = false;

    // Save a reference to the passed config
    this.config = { 
      targetModal, 
      modal, 
      disableScroll, 
      openTrigger, 
      closeTrigger, 
      onCreate, 
      onShow, 
      onClose, 
      awaitCloseAnimation, 
      content
    }

    // throttle the resize event on the window for better performance
    this.throttleResize = throttle(100,this.onResize.bind(this));

    // prebind functions for event listeners
    this.onClick = this.onClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);

    // initialize module
    this.init();
  }

  init(){
    if (!this.initialized) {
      this.createModal();
    }
    
    return this;
  }

  createModal(){
    let modalMarkup = this.modalTemplate || `
      <div id="${this.config.targetModal}" class="modal-slide ${this.config.modal ? 'modal' : 'dialog'}" aria-hidden="true">
        ${this.config.modal ? `<div tabindex="-1" class="modal__overlay" data-modal-close>` : ''}
          <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="${this.config.targetModal}-title">
            <button class="modal__btn-close" aria-label="Close modal" data-modal-close></button>
            <div id="${this.config.targetModal}-content" class="modal__content">
              ${this.config.content}
            </div>
            <button class="modal__btn-close modal__btn-close--bottom" aria-label="Close modal" data-modal-close></button>
          </div>
        ${this.config.modal ? `</div>` : ''}
      </div>`
    ;
    document.body.insertAdjacentHTML('beforeend',modalMarkup);
    // save a reference to the modal element
    this.modal = document.getElementById(this.config.targetModal);
    // save a reference to the modal content element
    this.modalContentEl = document.getElementById(this.config.targetModal + '-content');

    // store reference to the bottom close button for use in resize event
    this.bottomCloseButton = document.querySelector(`#${this.config.targetModal} .modal__btn-close--bottom`);
    
    // create callback
    this.config.onCreate(this.modal);
    // init complete
    this.initialized = true;
  }

  destroyModal(){
    this.modal.parentNode.removeChild(this.modal);
  }

  showModal(){
    // capture page focus
    this.activeElement = document.activeElement;

    this.modal.setAttribute('aria-hidden', 'false');
    // call onResize once to trigger visibility of bottom close button
    this.onResize();
    this.modal.classList.add('is-open');
    this.modalContentEl.scrollTop = 0;
    this.setFocusToFirstNode();
    this.scrollBehaviour('disable');
    this.addEventListeners();

    // open callback
    this.config.onShow(this.modal);
    
  }

  closeModal(){
    // save a modal reference for use inside event function
    const modal = this.modal;

    this.modal.setAttribute('aria-hidden','true');
    this.scrollBehaviour('enable');

    // restore page focus
    this.activeElement.focus();

    // close callback
    this.config.onClose(this.modal);

    // close animation
    if (this.config.awaitCloseAnimation) {
      this.modal.addEventListener('animationend', function handler () {
        modal.classList.remove('is-open');
        modal.removeEventListener('animationend', handler, false);
      }, false);
    } else {
      modal.classList.remove('is-open');
    }
  }

  // turn scrolling off on body
  scrollBehaviour (toggle) {
    if (!this.config.disableScroll) return
    if(toggle === 'enable') {
      enableBodyScroll(this.modalContentEl);
    } else {
      disableBodyScroll(this.modalContentEl);
    }
  }

  // render the HTML content inside the modal
  setContent(content){
    this.content = content;
    this.modalContentEl.innerHTML = content;
  }

  addEventListeners() {
    this.modal.addEventListener('touchstart', this.onClick);
    this.modal.addEventListener('click', this.onClick);
    document.addEventListener('keydown', this.onKeydown);
    window.addEventListener('resize', this.throttleResize, { 
      capture: true,
      passive: true
    });
  }

  removeEventListeners() {
    this.modal.removeEventListener('touchstart', this.onClick);
    this.modal.removeEventListener('click', this.onClick);
    document.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('resize', this.throttleResize, { 
      capture: true,
      passive: true
    });
  }

  onClick(event) {
    if (event.target.hasAttribute(this.config.closeTrigger)) {
      event.preventDefault();
      this.closeModal();
    }
  }

  onResize() {
    if(window.matchMedia("(max-width: 640px)").matches){
      this.bottomCloseButton.removeAttribute("aria-hidden");
    } else {
      this.bottomCloseButton.setAttribute("aria-hidden","true");
    }
  }

  onKeydown(event) {
    if (event.keyCode === 27) this.closeModal(event);
    if (event.keyCode === 9) this.maintainFocus(event);
  }

  getFocusableNodes() {
    const nodes = this.modal.querySelectorAll(FOCUSABLE_ELEMENTS);
    return Object.keys(nodes).map((key) => nodes[key]);
  }

  setFocusToFirstNode() {
    if (this.config.disableFocus) return;
    const focusableNodes = this.getFocusableNodes();
    if (focusableNodes.length) focusableNodes[0].focus();
  }

  maintainFocus(event) {
    const focusableNodes = this.getFocusableNodes();

    // if disableFocus is true
    if (!this.modal.contains(document.activeElement)) {
      focusableNodes[0].focus();
    } else {
      const focusedItemIndex = focusableNodes.indexOf(document.activeElement);

      if (event.shiftKey && focusedItemIndex === 0) {
        event.preventDefault();
        focusableNodes[focusableNodes.length - 1].focus();
      }

      if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
        event.preventDefault();
        focusableNodes[0].focus();
      }
    }
  }
}