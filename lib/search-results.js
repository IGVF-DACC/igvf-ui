// node_modules
import _ from "lodash";
// lib
import { getQueryStringFromServerQuery } from "./query-utils";

/**
 * Gets an array of item `@type` values from the search results, sorted (case sensitive) and with
 * duplicates removed. Only the first `@type` value for each item gets used.
 * @param {object} searchResults Search results from igvfd
 * @returns {array} Sorted unique item types in the search result items
 */
function getSearchResultItemTypes(searchResults) {
  const itemTypes = searchResults["@graph"].reduce((itemTypesAcc, item) => {
    const itemType = item["@type"][0];
    return !itemTypesAcc.includes(itemType)
      ? itemTypesAcc.concat(itemType)
      : itemTypesAcc;
  }, []);
  return _.sortBy(itemTypes);
}

/**
 * Composes a page title for search result pages. The profiles object has to have been loaded
 * before calling this function. An empty string gets returned if the profiles object doesn't
 * have a schema for the first item type in the search results.
 * @param {object} searchResults Search results from igvfd
 * @param {object} profiles System schemas
 * @returns {string} Page title for search results page
 */
export function composeSearchResultsPageTitle(searchResults, profiles) {
  const types = getSearchResultItemTypes(searchResults);
  const schema = profiles[types[0]];
  if (schema) {
    const title = schema.title;
    const remainingTypeCount = types.length - 1;
    return types.length > 1
      ? `${title} and ${remainingTypeCount} other type${
          remainingTypeCount > 1 ? "s" : ""
        }`
      : title;
  }
  return "";
}

/**
 * Determines whether the search-results query string contains a limit= query parameter with a
 * value > 1000, with more than one value, or with a non-numeric value. If so, return a query
 * string to redirect to search without the limit= query parameter; otherwise return an empty
 * string to indicate no redirect needed.
 * @param {object} query Query object from the server
 * @returns {string} Query string to redirect to search without the limit= query parameter; empty
 *   string if no redirect needed
 */
export function stripLimitQueryIfNeeded(query) {
  if (query.limit) {
    // Multiple limit= query parameters, or a non-numeric ones, get unconditionally stripped.
    const limit =
      Array.isArray(query.limit) || isNaN(query.limit)
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
