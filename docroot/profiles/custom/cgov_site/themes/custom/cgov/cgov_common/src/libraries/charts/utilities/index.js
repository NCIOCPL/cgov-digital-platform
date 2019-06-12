/**
 * Ascertain whether a path that matches the current base rule should be excluded based on sub rules.
 *
 * NOTE: This is the same function as the one in floatingDelighter and could be made more agnostic
 * to be shared across the site as a general utility function (if the data structure of rules is standardized as
 * well).
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
 * Test whether a rule exists that matches a given pathname, which determines
 * whether we add Chart to the window.
 *
 * @param {String} pathName
 * @param {Object[]} rules
 * @returns {Boolean}
 */
export const getShouldLoadChartWrapper = (pathName, rules) => {
    // Test for path partial match in Map, if a perfect match is found or a partial map with no exclusion rules
    // return the appropriate delighter settings immediately. Otherwise we need to map through the exclusion list rules
    // and their possible associated whitelist paths.
    for(let i = 0; i < rules.length; i++) {
        const config = rules[i]
        const basePathRule = config.rule;

        if(pathName.match(basePathRule)) {
            const exclusions = config.exclude;
            if(!exclusions) {
                return true
            }

            const isOnExclusionList = checkExclusions(pathName, exclusions);
            return isOnExclusionList ? false : true;
        }
    }

    return false
};
