/**
 * Use the same title for PhenotypicFeature search page and PhenotypicFeature object page for that PhenotypicFeature
 * @param {object} phenotypicFeature Object to get the title from
 * @returns {string} title for item in search list or for the given object page
 */
export function getPhenotypicFeatureTitle(phenotypicFeature) {
  const title = `${phenotypicFeature.feature.term_name} ${
    phenotypicFeature.quantity
      ? ` - ${phenotypicFeature.quantity} ${phenotypicFeature.quantity_units}`
      : ""
  }`;
  return title;
}
