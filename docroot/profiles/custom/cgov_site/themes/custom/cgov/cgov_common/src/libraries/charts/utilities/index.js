/**
 * Determine whether a matched chart route should be skipped by exclusion rules.
 *
 * @param {String} pathName Path of current page.
 * @param {Array<RegExp|Object>} exclusions Exclusion rules for paths to skip.
 * @returns {boolean} true if current path should be excluded, else false.
 */
export const checkExclusions = (pathName, exclusions) => {

    const exclusionMatches = exclusions.map(exclusion => {
        // Object exclusions allow specific paths back in through `whitelist`.
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
 * Test whether chart initialization should inspect the current page.
 *
 * @param {String} pathName Path of current page.
 * @param {Object[]} rules Route rules from charts/rules.js.
 * @returns {Boolean} true when the page may contain registered chart hooks.
 */
export const getShouldLoadChartWrapper = (pathName, rules) => {
    // Stop at the first matching base rule; rule ordering is intentional.
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

/**
 * Replace formatter placeholders from JSON with executable axis label formatters.
 *
 * @param {Array} axisData Axis configuration from a chart data file.
 * @param {Array} labelFormatter Formatter functions keyed by axis index.
 * @returns {Array} Axis configuration with formatter functions attached.
 */
export function buildAxisData(axisData, labelFormatter) {
  for (let i = 0; i < axisData.length; i++) {
    if (axisData[i].labels.hasFormatter) {
      delete axisData[i].labels.hasFormatter;
      axisData[i].labels.formatter = labelFormatter[i].formatter;
    }
  }
  return axisData;
};
