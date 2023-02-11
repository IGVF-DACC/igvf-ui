// node_modules
import _ from "lodash";

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
