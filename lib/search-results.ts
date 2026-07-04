// lib
import { getQueryStringFromServerQuery } from "./query-utils";
// types
import type {
  CollectionTitles,
  NextJsServerQuery,
  Profiles,
  ProfilesProps,
  SearchResults,
  SearchResultsFacetTerm,
  SearchResultsFilter,
} from "../globals";

/**
 * Type guard for search responses returned by the data provider.
 *
 * @param response - Potential search response object
 * @param type - Optional type to check for in the "@type" field of the search response
 * @returns True if response matches the minimal SearchResults shape used here
 */
export function isSearchResults(item: unknown): item is SearchResults {
  if (!item || typeof item !== "object") {
    return false;
  }

  return (
    "facets" in item &&
    Array.isArray(item.facets) &&
    "@id" in item &&
    typeof item["@id"] === "string" &&
    "@type" in item &&
    Array.isArray(item["@type"])
  );
}

/**
 * Type guard that checks if search results facet terms are present and appear as normal facet
 * terms, not missing nor an unusual shape. This is used to determine if the facet terms can be
 * rendered in a standard way, or if they need special handling.
 *
 * @param item - Potential search results facet term object
 * @returns True if item is an array of SearchResultsFacetTerm
 */
export function isSearchResultsFacetTerms(
  item: unknown
): item is SearchResultsFacetTerm[] {
  if (!item || typeof item !== "object") {
    return false;
  }

  return (
    Array.isArray(item) &&
    item.every(
      (term) =>
        typeof term === "object" &&
        term !== null &&
        "key" in term &&
        "doc_count" in term
    )
  );
}

/**
 * Builds an array of concrete types returned from search results. The profiles object has to have
 * loaded to get results from this function, or else it returns an empty array.
 *
 * @param searchResults - Search results from igvfd
 * @param profiles - Profiles object from igvfd if loaded
 * @param collectionTitles - Map of collection identifiers to titles
 * @returns Page title for search results page
 */
export function generateSearchResultsTypes(
  searchResults: SearchResults,
  profiles: Profiles | null,
  collectionTitles: CollectionTitles | null
): string[] {
  if (profiles) {
    // Use the "type" facet in the search results.
    const typeFacet = searchResults.facets.find(
      (facet) => facet.field === "type"
    );
    if (typeFacet) {
      // Get all concrete types from the search results.
      const terms = typeFacet.terms as SearchResultsFacetTerm[];
      const allResultTypes = terms
        .map((term) => term.key)
        .filter((key): key is string => typeof key === "string");
      const concreteTypes = allResultTypes.filter((type) => {
        const typeSubtypes = (profiles as ProfilesProps)._subtypes[type];
        return (
          typeSubtypes && typeSubtypes.length === 1 && type === typeSubtypes[0]
        );
      });
      const readableTitles: string[] = collectionTitles
        ? concreteTypes
            .map((type) => collectionTitles[type])
            .filter((title): title is string => typeof title === "string")
        : concreteTypes;
      return readableTitles.sort();
    }
  }
  return [];
}

/**
 * Determines whether the search-results query string contains a limit= query parameter with a
 * value > 1000, with more than one value, or with a non-numeric value. If so, return a query
 * string to redirect to search without the limit= query parameter; otherwise return an empty
 * string to indicate no redirect needed.

 * @param query - Query object from the server
 * @returns Query string to redirect to search without the limit= query parameter; empty
 *   string if no redirect needed
 */
export function stripLimitQueryIfNeeded(query: NextJsServerQuery): string {
  if (query.limit) {
    // Multiple limit= query parameters, or a non-numeric ones, get unconditionally stripped.
    const limit =
      Array.isArray(query.limit) || isNaN(Number(query.limit))
        ? -1
        : Number(query.limit);
    if (limit === -1 || limit > 1000) {
      delete query.limit;
      return getQueryStringFromServerQuery(query);
    }
  }

  // Return an empty string to indicate we don't need a redirect.
  return "";
}

/**
 * Get the specified field's facet terms and filters from the search results.
 *
 * @param searchResults - Search results from back end
 * @returns List of facet terms and filters for the specified field, or empty arrays if none found
 */
export function getFieldTermsAndFilters(
  field: string,
  searchResults: SearchResults
): {
  terms: SearchResultsFacetTerm[];
  filters: SearchResultsFilter[];
} {
  // Find the preferred assay slims facet in the search results and get its terms.
  const facet = searchResults.facets.find(
    (maybeFacet) => maybeFacet.field === field
  );
  const terms =
    facet && isSearchResultsFacetTerms(facet.terms) ? facet.terms : [];

  // Find any filters in search results for the preferred assay slims facet.
  const filters = searchResults.filters.filter(
    (filter) => filter.field === field
  );

  return {
    terms,
    filters,
  };
}
