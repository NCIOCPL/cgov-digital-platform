import { getNodeArray } from 'Utilities';

// This is a tiny example module that should demonstrate a few useful practices.
// We will be interacting with the DOM and doing some logical processing.
// Testing DOM interactions is more difficult because of potential side effects, so we should
// always try to separate as much of the pure logic (easily testable because the same input always givesd the same output) 
// out of the processes that are not pure (have side effects).


/**
 * Do a regex replace on a string of any occurences of the word cancer with ******
 * @param {string} string
 * @return {string}
 */
export const censorWord = string => string.replace(/cancer/gi, '******');

/**
 * Mutate an array of DOM nodes to censor the textContent according to censorWord()
 * @param {HTMLElement[]} headers
 * @param {HTMLElement[]}
 */
export const censorText = (headers) => {
    const censored = headers.map(header => {
        header.textContent = censorWord(header.textContent);
        return header;
    })
    return censored;
}

/**
 * Censor Module
 * -------------
 * Find all h3s on a page and censor the text appropriately.
 */
const initialize = () => {
    const headers = getNodeArray('h3');
    const censoredHeaders = censorText(headers);
}

export default initialize;

