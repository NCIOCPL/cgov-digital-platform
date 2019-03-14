import {
    censorWord,
    censorText,
    default as initialize,
} from '../index';

describe('EXAMPLE library', () => {
    
    // NOTE: censorWord is a pure function to handle strings. Testing should be easy peasy. String -> String.
    // Just be sure to think about testing undesired behavior as well.
    describe('censorWord()', () => {
        it('should censor the word \'cancer\'', () => {
            const expected = '******';
            const actual = censorWord('cancer')
            expect(actual).toBe(expected);
        })
        it('should be case-insensitive', () => {
            const expected = '******';
            const actuals = ['Cancer', 'CANCER', 'cAnCeR'].map(word => censorWord(word));
            actuals.forEach(actual => {
                expect(actual).toBe(expected);
            })
        })
        it('should handle multiple occurences of \'cancer\' in one string', () => {
            const string = 'How can cancer be so cancery?';
            const expected = 'How can ****** be so ******y?';
            const actual = censorWord(string);
            expect(actual).toBe(expected);
        })
    })

    // NOTE: censorText is impure (it returns the same input but with changes) and handles DOM nodes.
    // However, because we return the input (even though it is unnecessary for the function to be effective),
    // we can test the functions behaviour without needing to interact with the DOM.
    describe('censorText()', () => {
        // We can test this with mock DOM nodes that mimic only the required functionality...
        it('should censor the textContent of given DOM nodes - version 1', () => {
            const array = [
                { textContent: 'How can cancer be so cancery?'},
                { textContent: "It's cancerific!"},
            ];
            const expected = [
                { textContent: 'How can ****** be so ******y?'},
                { textContent: "It's ******ific!"},
            ];
            const actual = censorText(array);

            // We use toEqual for testing Objects that have different references but the same contents
            expect(actual).toEqual(expected);
        })
        
        // ...Or with real ones
            it('should censor the textContent of given DOM nodes - version 2', () => {
                const baseText = ['How can cancer be so cancery?', "It's cancerific!"];
                const array = baseText.map(text => {
                    const node = document.createElement('h3');
                    node.textContent = text;
                    return node;
                })
                const expected = ['How can ****** be so ******y?', "It's ******ific!"];

                const actuals = censorText(array);
                actuals.forEach((actual, index) => {
                    // But we can use toBe for primitives like strings, numbers, and booleans
                    expect(actual.textContent).toBe(expected[index]);
                })
            })
    })

    // NOTE: initialize is impure, takes no input, and returns no output, so it is the least ideal
    // type of function to write a test for. In order to determine if it works, we need to create
    // a DOM for the function to interact with and then test the DOM to see if it has changed as expected.
    // NOTE: We should improve this function by at least returning the results of the processing, so 
    // tests can be run against the function's output instead of the DOM itself to make things easier.
    describe('initialize()', () => {
        // This is a simple way to create a 'page' in JSDOM (the browser-like environment Jest makes
        // available to us for testing by default)
        const h1InnerText = 'Cancer';
        const pInnerText = "Dear Margaret, it's me, God. Have you seen my sunglasses? Oops, nevermind, here they are. Cancer.";
        const firstH3InnerText = "Cancer is feeling crabby";
        const secondH3InnerText = "Cancer is canserious";
        const thirdH3InnerText = "Hoopla";
        const testHTML = `
            <h1>${ h1InnerText }</h1>
            <h3 id="first-h3">${ firstH3InnerText }</h3>
            <p>${ pInnerText }</p>
            <h3 id="second-h3">${ secondH3InnerText }</h3>
            <h3 id="third-h3">${ thirdH3InnerText }</h3>
        `;

        // Generally, we would want to start with a fresh webpage each time we run a new test, so instead
        // of just doing the setup at the beginning, we'll do it in a function that runs before each test
        // (This isn't actually necessary here, but it's often very useful)
        beforeEach(() => {
            document.documentElement.innerHTML = testHTML;
            initialize();
        })

        it('should not affect elements that are not h3s', () => {
            const h1 = document.querySelector('h1');
            const p = document.querySelector('p');
            expect(h1.textContent).toBe(h1InnerText);
            expect(p.textContent).toBe(pInnerText);
        })

        it('should affect all relevant h3s on a page', () => {
            const first = document.getElementById('first-h3');
            const second = document.getElementById('second-h3');
            const third = document.getElementById('third-h3');
            expect(first.textContent).not.toBe(firstH3InnerText);
            expect(second.textContent).not.toBe(secondH3InnerText);
            expect(third.textContent).toBe(thirdH3InnerText);
        })
    })
})