/***
 * @file
 * Adds event listener to DOM to initialize app once DOM is loaded.
 */

import initializeR4RApp from 'Libraries/r4r/r4r';
import './r4r-app.scss';

const onDOMContentLoaded = () => {
	initializeR4RApp();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
