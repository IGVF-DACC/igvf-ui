// node_modules
import _ from "lodash";
// lib
import { getQueryStringFromServerQuery } from "./query-utils";
// types
import {
  CollectionTitles,
  NextJsServerQuery,
  Profiles,
  ProfilesProps,
  SearchResults,
  SearchResultsFacetTerm,
} from "../globals";

/**
 * Builds an array of concrete types returned from search results. The profiles object has to have
 * loaded to get results from this function, or else it returns an empty array.
 * @param {SearchResults} searchResults Search results from igvfd
 * @param {Profiles|null} profiles Profiles object from igvfd if loaded
 * @param {CollectionTitles|null} collectionTitles Map of collection identifiers to titles
 * @returns {string[]} Page title for search results page
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
 * @param {NextJsServerQuery} query Query object from the server
 * @returns {string} Query string to redirect to search without the limit= query parameter; empty
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
