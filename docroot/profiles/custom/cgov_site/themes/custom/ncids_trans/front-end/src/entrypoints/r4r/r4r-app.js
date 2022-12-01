/*
 * Adds event listener to DOM to initialize app once DOM is loaded.
 */

import initializeR4RApp from 'Libraries/r4r/r4r';
import '@nciocpl/r4r-app/build/static/css/main.css';
import '@nciocpl/r4r-app/public/R4R.css';
import './r4r-app-legacy.scss';

const onDOMContentLoaded = () => {
	initializeR4RApp();
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
