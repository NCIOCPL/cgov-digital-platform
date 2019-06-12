/**
* A rule is an object required to have a rule and delighter property. The third property exclude is optional. Exclude is an array of regular expressions and/or
* objects containing a rule (regex) and whitelist (array) property.
*
* NOTE: The function that tests rules is lazy and will only return the first match, so make sure a previous rule doesn't conflict with yours if it's not working.
*/
const rules = [
  {
    // This rule includes Chart on all pages and subpages for this path. No exclusions.
    rule: /^\/about-nci\/budget\/fact-book/i,
  },
];

export default rules;
