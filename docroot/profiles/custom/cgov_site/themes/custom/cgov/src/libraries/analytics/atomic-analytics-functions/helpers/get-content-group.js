/**
 * Get the content group (currently used for prop44, prop66) from the
 * 'isPartOf' metatag.
 */
export default function () {
  let metaTag = document.head.querySelector('[name="dcterms.isPartOf"]');
  let metaVal = '';
  if (metaTag) {
      metaVal = metaTag.content || '';
  }
  return metaVal;
};
