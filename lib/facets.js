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
