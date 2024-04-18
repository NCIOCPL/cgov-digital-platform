import getBlogLocation from "./get-blog-location";
import getContentGroup from "./get-content-group";

/**
 * Build the concatenated value for blog custom links (usually prop66).
 *
 * @param {string} value - custom value or indexed item.
 */
export default function (value) {
  let linkArr = [getContentGroup()];

  // Add blog values if set.
  if (getBlogLocation()) {
      linkArr.unshift('Blog');
      linkArr.push(getBlogLocation());
  }

  // Add custom value if set.
  if (value) {
      linkArr.push(value);
  }

  return linkArr.join('_').trim();
};
