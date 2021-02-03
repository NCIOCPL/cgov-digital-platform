/***
 * @file
 * Adds event listener to DOM to initialize app once DOM is loaded.
 */

import initializeSitewideSearchApp from "Libraries/sitewideSearch/sitewideSearchApp";
// import "./SitewideSearchApp.scss";

const onDOMContentLoaded = () => {
  initializeSitewideSearchApp();
};

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
