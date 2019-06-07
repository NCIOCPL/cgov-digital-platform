import {
    checkExclusions,
    getDelighterSettings,
    buildDelighter,
} from '../index';
import rules from '../../rules';
import {
    customEventGlobalNamespace
} from 'Core/libraries/customEventHandler';

const testDelighter = {
    href: '/test',
    innerHTML: '<div>Test</div>',
    classList: ['test__test--test']
};

const testRule = {
    rule: /^\/test$/i,
    delighter: testDelighter
};

rules.push(testRule);

describe('MODULE: Floating Delighter Utilities', () => {
    describe('METHOD: checkExclusions()', () => {
        it('should return false if no exclusions match the pathname', () => {
            const pathname = '/test/123';
            const exclusions = [
                /\/test$/i,
            ];
            const actual = checkExclusions(pathname, exclusions);
            const expected = false;
            expect(actual).toBe(expected);
        })
        it('should return true if an exclusion matches the pathname', () => {
            const pathname = '/test/123';
            const exclusions = [
                /\/[0-9]+$/i,
            ];
            const actual = checkExclusions(pathname, exclusions);
            const expected = true;
            expect(actual).toBe(expected);
        })
        it('should return false if an exclusion matches but the pathname is whitelisted', () => {
            const pathname = '/test/123';
            const exclusions = [
                {
                    rule: /\/[0-9]+$/i,
                    whitelist: [
                        '/test/123',
                    ]
                }
            ];
            const actual = checkExclusions(pathname, exclusions);
            const expected = false;
            expect(actual).toBe(expected);
        })
    });

    describe('METHOD: getDelighterSettings()', () => {
        it("should return undefined if a rule can't be found to match the pathname", () => {
            const pathname = '/non-existant/path';
            expect(getDelighterSettings(pathname, rules)).toBe(undefined);
        });
        it("should return a delighter config if a rule can be found that matches the pathname", () => {
            expect(getDelighterSettings(testDelighter.href, rules)).toEqual(testDelighter);
        })
    });

    describe('METHOD: buildDelighter()', () => {
        const output = buildDelighter(testDelighter);
        it('should return a div element with classes matching those provided as a param', () => {
            const actual = testDelighter.classList.filter(className => output.classList.contains(className));
            expect(actual.length + 1).toBe(output.classList.length); // + 1 for the base class added inside the function
        });
        it('should return a div wrapping an anchor element with an href matching that provided as a param', () => {
            const anchor = output.querySelector('a');
            expect(anchor.href).toBe(window.location.origin + testDelighter.href);
        });
        it('should return a div wrapping an anchor element with innerHTML matching that provided as a param', () => {
            const anchor = output.querySelector('a');
            expect(anchor.innerHTML).toBe(testDelighter.innerHTML);
        });
        it('should return a div wrapping an anchor element with a click listener broadcasting a customEvent', () => {
            const eventListener = jest.fn();
            output.addEventListener(customEventGlobalNamespace, eventListener);
            const anchor = output.querySelector('a');
            anchor.click();
            expect(eventListener.mock.calls.length).toBe(1);
        })
    })
});
