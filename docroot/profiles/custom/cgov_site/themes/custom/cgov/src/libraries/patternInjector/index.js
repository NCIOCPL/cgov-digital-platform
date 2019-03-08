import GeoPattern from 'geopattern';
import { getNodeArray } from 'Core/utilities';

/**
 * This is a helper library that wraps the GeoPattern external library and simplifies component calls to it for
 * injecting patterns into the DOM.
 *
 */

const buildPattern = (seed = `${Date.now()}`) => {
    let pattern;
    if(typeof seed === 'string') {
        pattern = GeoPattern.generate(seed);
    }
    else if(seed && typeof seed === 'object') {
        const {
            str = '',
            options = {}
        } = seed;

        try {
            pattern = GeoPattern.generate(str, options);
        }
        catch(err) {
            pattern = GeoPattern.generate(str);
            console.log('Invalid options', err);
        }
    }
    else {
        throw new Error('Invalid seed provided for GeoPattern');
    }
    const dataUrl = pattern.toDataUrl();
    return dataUrl;
};

const insertPatternIntoElement = (element, imgData) => {
    if(element && imgData) {
        element.style.backgroundImage = imgData;
    }
    return element;
};

const processBackgrounds = settings => {
    const elementTypes = Object.entries(settings);
    return elementTypes.map(elementValues => {
        const selector = elementValues[0];
        const elements = getNodeArray(selector);
        const seed = elementValues[1];
        const pattern = buildPattern(seed);
        return elements.map(element => insertPatternIntoElement(element, pattern));
    });
}


/**
 * Using the GeoPattern NPM library, inject on-the-fly rendered SVG patterns into the DOM.
 * Pass a settings object containing keys matching a selector string for the elements you wish to process,
 * and values that are either a string (representing a random seed) or an object with color, basecolor, and or generator
 * keys with string values (see https://github.com/btmills/geopattern for a more detailed explanation)
 *
 * If you only want to run the injector on certain pages and have no other options for encapsulation,
 * pass a querySelector string as the second argument. It will abort the process if the specified
 * test case element can not be found.
 *
 * @param {object} settings
 * @param {string} [pageCheckQuery='body'] - A valid querySelector string
 * @return {array}
 */
const publicAPI = (settings, pageCheckQuery = 'body') => {
    const isDesiredPage = document.querySelector(pageCheckQuery);
    if(isDesiredPage) {
        return processBackgrounds(settings);
    }
    return [];
}

export default publicAPI;
