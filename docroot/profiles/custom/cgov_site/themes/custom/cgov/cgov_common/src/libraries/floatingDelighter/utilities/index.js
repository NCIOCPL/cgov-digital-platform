import { broadcastCustomEvent } from 'Core/libraries/customEventHandler';

/**
 * Ascertain whether a path that matches the current base rule should be excluded based on sub rules.
 *
 * @param {String} pathName Path of current page.
 * @param {Array<RegeExp|Object>} exclusions Exclusion rules for paths to be excluded by base rule match.
 * @returns {boolean} true if current path should be excluded, else false.
 */
export const checkExclusions = (pathName, exclusions) => {

    const exclusionMatches = exclusions.map(exclusion => {
        // Exclusions can either be a simple RegExp or an object with the shape { rule: RegExp, whitelist: Array }
        if (exclusion instanceof RegExp) {
            const isOnExclusionList = pathName.match(exclusion) ? true : false;
            return isOnExclusionList;
        }
        else {
            const isOnExclusionList = pathName.match(exclusion.rule) ? true : false;
            const isOnWhiteList = exclusion.whitelist.includes(pathName);
            return isOnExclusionList ? !isOnWhiteList : false;
        }
    })

    const isOnExclusionList = exclusionMatches.includes(true);
    return isOnExclusionList;
}

/**
 * Test whether a rule exists that matches a given pathname. Return the appropriate delighter config object in the case
 * of a match, otherwise undefined.
 *
 * @param {String} pathName
 * @param {Object[]} rules
 * @returns {Object} If rule found matching current path return delighter config, else undefined.
 */
export const getDelighterSettings = (pathName, rules) => {
    // Test for path partial match in Map, if a perfect match is found or a partial map with no exclusion rules
    // return the appropriate delighter settings immediately. Otherwise we need to map through the exclusion list rules
    // and their possible associated whitelist paths.
    for(let i = 0; i < rules.length; i++) {
        const config = rules[i]
        const basePathRule = config.rule;

        if(pathName.match(basePathRule)) {
            const exclusions = config.exclude;
            if(!exclusions) {
                return config.delighter
            }

            const isOnExclusionList = checkExclusions(pathName, exclusions);
            return isOnExclusionList ? undefined : config.delighter;
        }
    }
};

/**
 * Create a delighter element and attach analytics
 *
 * @param {Object} param0
 * @param {String} param0.href
 * @param {String} param0.innerHTML
 * @param {String[]} [param0.classList = []]
 * @return {HTMLElement} Detached delighter to be appended to DOM
 */
export const buildDelighter = ({ href, innerHTML, classList = [] }) => {
    const delighter = document.createElement('div');
    delighter.classList.add('floating-delighter');
    classList.map(className => delighter.classList.add(className))

    const link = document.createElement('a');
    link.href = href;
    link.classList.add('floating-delighter__link');
    link.innerHTML = innerHTML;

    const broadcastClickEvent = broadcastCustomEvent('NCI.floating-delighter.click', {
        node: link,
    });
    link.addEventListener('click', broadcastClickEvent);

    delighter.appendChild(link);

    return delighter;
}
