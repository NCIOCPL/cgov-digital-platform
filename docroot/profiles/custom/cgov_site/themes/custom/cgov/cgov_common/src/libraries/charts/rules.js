/**
 * Route rules that decide whether chart initialization should inspect a page.
 *
 * A rule must include `rule`, a regular expression tested against the current
 * pathname. It may include `exclude`, an array of regular expressions or
 * objects shaped as `{ rule: RegExp, whitelist: string[] }`.
 *
 * Rules are evaluated in order and the first matching base rule wins, so keep
 * broader paths below more specific ones if exclusions are added later.
 */
const rules = [
  {
    // Fact Book is the only route family that currently renders these charts.
    rule: /^\/about-nci\/budget\/fact-book/i,
  },
];

export default rules;
