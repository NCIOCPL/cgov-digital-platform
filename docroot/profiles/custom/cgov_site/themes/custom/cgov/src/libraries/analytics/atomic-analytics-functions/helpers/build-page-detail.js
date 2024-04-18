/** Defines page detail value, primary focus is pdq page sections as of initial logic
 * this logic should be part of the initial page load call (s.prop28)
 */
export default function () {
  let return_val = "";

  // find name of current pdq section
  // Note: any special characters in the id need to be escaped.
  const hash = document.location.hash
    .replace(/#?(section|link)\//g, "")
    .replace(/#/g, "")
    .replace(
      /([\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~])/g,
      "\\$1"
    );

  if (hash) {
    const selector = document.querySelector("#" + hash + " h2");
    if (selector) {
      return_val = selector.textContent.toLowerCase();
    }
  }

  // add '/' as prefix, if return_val exists and '/' not already present
  if (return_val && return_val.indexOf("/") != 0) {
    return_val = "/" + return_val;
  }
  return return_val;
}
