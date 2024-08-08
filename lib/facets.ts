/**
 * Facet fields that don't get displayed as a facet.
 */
const HIDDEN_FACET_FIELDS = ["type"];

/**
 * From a single filter from search results, extract the term for that filter. For example, with
 * the filter for `type=InVitroSystem`, the term is `InVitroSystem`. This function also takes
 * wildcard terms into account. For example, with the filter `type=*`, this function returns is
 * `ANY`. If instead the filter is `type!=*`, this function returns `NOT`.
 * @param filter Search result filter object for a single term
 * @returns Term for the filter, including wildcard terms
 */
export function getFilterTerm(filter: { field: string; term: string }): string {
  const isAnyOrNot = filter.term === "*";

  let term;
  if (isAnyOrNot) {
    const isNot = filter.field.at(-1) === "!";
    term = isNot ? "NOT" : "ANY";
  } else {
    term = filter.term;
  }

  return term;
}

/**
 * Filter out the hidden facet fields from the given array of facets.
 * @param facets Property of search results
 * @returns Facets that the user can see
 */
export function getVisibleFacets(
  facets: { field: string; count: number }[]
): { field: string; count: number }[] {
  return facets.filter((facet) => !HIDDEN_FACET_FIELDS.includes(facet.field));
}
