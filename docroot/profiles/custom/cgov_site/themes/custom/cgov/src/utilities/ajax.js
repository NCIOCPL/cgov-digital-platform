/**
 * Dynamically load scripts from other websites. Returns a promise that resolves when the script 
 * loads or rejects when the script onerror function triggers
 * 
 * NOTE: The script is appended to the DOM before the first script on the page. 
 * 
 * @param {String} url of script to include
 * @return {Promise} resolve with DOM node of element
 */
export const loadScript = url => new Promise((resolve, reject) => {
    const element = document.createElement('script');
    element.src = url;
    element.addEventListener('load', () => resolve(element));
    element.addEventListener('error', reject);
    const firstElementOfType = document.querySelector('script');
    firstElementOfType.parentNode.insertBefore(element, firstElementOfType);
});

/**
 * Dynamically load stylesheets from other websites. Returns a promise that resolves when the stylesheet 
 * loads or rejects when the onerror function triggers
 * 
 * NOTE: The stylesheet is appended to the DOM before the first link/rel=stylesheet on the page. 
 * 
 * @param {String} url of stylesheet to include
 * @return {Promise} resolve with DOM node of element
 */
export const loadStylesheet = url => new Promise((resolve, reject) => {
    const element = document.createElement('link');
    element.rel = 'stylesheet';
    element.href = url;
    element.addEventListener('load', () => resolve(element));
    element.addEventListener('error', reject);
    const firstElementOfType = document.querySelector('link');
    firstElementOfType.parentNode.insertBefore(element, firstElementOfType);
})