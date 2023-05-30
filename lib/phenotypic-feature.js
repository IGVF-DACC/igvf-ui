/**
 * Use the same title for PhenotypicFeature search page and PhenotypicFeature object page for that PhenotypicFeature
 */
export function getPhenotypicFeatureTitle(phenotypicFeature) {
  const title = `${phenotypicFeature.feature.term_name} ${
    phenotypicFeature.quantity
      ? ` - ${phenotypicFeature.quantity} ${phenotypicFeature.quantity_units}`
      : ""
  }`;
  return title;
}
