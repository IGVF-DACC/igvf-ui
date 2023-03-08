/**
 * Facet fields that don't get displayed as a facet.
 */
const HIDDEN_FACET_FIELDS = ["type"];

/**
 * Filter out the hidden facet fields from the given array of facets.
 * @param {array} facets Property of search results
 * @returns {array} Facets that the user can see
 */
export function getVisibleFacets(facets) {
  return facets.filter((facet) => !HIDDEN_FACET_FIELDS.includes(facet.field));
}

/**
 * Generate a string that we can use as a key to remount the `<FacetSection>` component when
 * navigating between search results pages. This causes the currently selected facet group to reset
 * to the first one. This string consists of the search path and the type= portion of the query
 * string, but no other parts of the query string so that we don't remount just because the user
 * selects a facet.
 * @param {object} searchResults Search results from data provider
 * @returns {string} Search path and type= portion of query string
 */
export function generateFacetKey(searchResults) {
  return searchResults.clear_filters;
}
