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
} from "../globals.d";

/**
 * Gets an array of type= values from the search/report query string, returning them sorted
 * alphabetically, and with duplicates removed.
 * @param {SearchResults} searchResults Search results from igvfd
 * @returns {string[]} Sorted unique item types in the search result items
 */
function getSearchResultItemTypes(searchResults: SearchResults): string[] {
  const typeFilters = searchResults.filters.filter(
    (filter) => filter.field === "type"
  );
  if (typeFilters.length > 0) {
    const itemTypes = new Set(typeFilters.map((filter) => filter.term));
    return Array.from(itemTypes).sort();
  }
  return [];
}

/**
 * Composes a page title for search result pages. The profiles object has to have been loaded to
 * get results from this function. An empty string gets returned if the profiles object doesn't
 * have a schema for the first item type in the search results.
 * @param {SearchResults} searchResults Search results from igvfd
 * @param {Profiles|null} profiles Profiles object from igvfd if loaded
 * @param {CollectionTitles|null} collectionTitles Map of collection identifiers to titles
 * @returns {string} Page title for search results page, or empty if unable to compose
 */
export function composeSearchResultsPageTitle(
  searchResults: SearchResults,
  profiles: Profiles | null,
  collectionTitles: CollectionTitles | null
): string {
  if (profiles) {
    const types = getSearchResultItemTypes(searchResults);
    if (types.length > 0) {
      const titleElements = types.map((type) => {
        // Determine the concrete subtypes of an abstract type. A single subtype indicates that
        // `type` is a concrete type and has no subtypes.
        const subTypes = (profiles as ProfilesProps)._subtypes[type];
        const hasSubTypes = subTypes ? subTypes.length > 1 : false;

        const displayedType = collectionTitles ? collectionTitles[type] : type;
        return hasSubTypes ? `Subtypes of ${displayedType}` : displayedType;
      });
      return titleElements.join(", ");
    }
  }
  return "";
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
