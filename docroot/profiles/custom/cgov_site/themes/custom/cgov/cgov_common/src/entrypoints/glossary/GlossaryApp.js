/***
 * @file
 * Adds event listener to DOM to initialize app once DOM is loaded.
 */

import initializeGlossaryApp from 'Libraries/glossary/glossary';
import './GlossaryApp.scss';

const onDOMContentLoaded = () => {
  initializeGlossaryApp();
};

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
