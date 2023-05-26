// Use the same title for biomarker search page and biomarker object page for that biomarker
export function getPhenotypicFeatureTitle(phenotypicFeature) {
  const title = phenotypicFeature.quantity
    ? phenotypicFeature.feature.term_name +
      " - " +
      phenotypicFeature.quantity +
      " " +
      phenotypicFeature.quantity_units
    : phenotypicFeature.feature.term_name;
  return title;
}
