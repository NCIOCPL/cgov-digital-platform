/**
 * Create a new popup window with a specified url and optional window settings. 
 * 
 * This is a glorified wrapper around window.open to allow for custom defaults and will function similarly, 
 * including returning the window object representing the popup. This can be used for testing against 
 * it's existence (for example using a setinterval to check if it still exists and executing a callback 
 * and clearing the interval when it no longer does).
 * 
 * See https://developer.mozilla.org/en-US/docs/Web/API/Window/open for all available settings and
 * browser compatibility issues.
 * 
 * Defaults are: {
        height: 400,
        width: 500,
        toolbar: 'no',
        status: 'no',
        directories: 'no',
        menubar: 'no',
        scrollbars: 'yes',
        resizable: 'no',
        centerscreen: 'yes',
        chrome: 'yes',        
    }
    Top and left are calculated to make the window appear at the center of it's parent window.
 * 
 * 
 * @param {string} url
 * @param {object} [customOptions={}]
 * @return {object} Window object
 */
export const newWindow = (url, customOptions = {}) => {
    if(typeof url !== 'string' || url === '') {
        throw new Error('Invalid input provided. Need URL to be a valid string.');
    }
    // Allow either an empty object or null to be passed to signify no custom options
    customOptions = customOptions !== null ? customOptions : {};

    const height = customOptions.height || 400;
    const width = customOptions.width || 500;
    const left = (window.outerWidth / 2) + (window.screenX || window.screenLeft || 0) - (width / 2);
    const top = (window.outerHeight / 2) + (window.screenY || window.screenTop || 0) - (height / 2);

    const defaultOptions = {
        left,
        top,
        height,
        width,
        toolbar: 'no',
        status: 'no',
        directories: 'no',
        menubar: 'no',
        scrollbars: 'yes',
        resizable: 'no',
        centerscreen: 'yes',
        chrome: 'yes',        
    };

    const options = Object.assign({}, defaultOptions, customOptions)
    const optionsString = Object.entries(options)
                                .map(([feature, setting]) => `${feature}=${setting}`)
                                .join(', ');

    const openWindow = window.open(url, '', optionsString)

    return openWindow;
};