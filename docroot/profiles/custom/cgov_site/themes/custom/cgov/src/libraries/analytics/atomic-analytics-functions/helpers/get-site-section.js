/**
 * Silly helper function that is used to set a variable instead of being called each time.
 *
 * p.s. it is never called with pagePathOverride.
 *
 * @param {*} pagePathOverride
 * @returns
 */
export default function (pagePathOverride) {
  var path = pagePathOverride || document.location.pathname;

  if(/grants\-training\/grants/gi.test(path)) { return('oga'); }
  if(/grants\-training\/training/gi.test(path)) { return('cct'); }
  if(/pdq/gi.test(path)) { return('pdq'); }
  return('');

};
