// libs
import FetchRequest from "./fetch-request";

/**
 * The search mode for the search term. This specifies either the title of the schema or the
 * content of the schema.
 */
export const SEARCH_MODE_TITLE = "SEARCH_MODE_TITLE";
export const SEARCH_MODE_PROPERTIES = "SEARCH_MODE_PROPERTIES";

/**
 * Loads the schemas for all object types, with each key of the object being the @type for each
 * schema.
 * @param {object} session Authentication session object
 * @returns {Promise<DataProviderObject | ErrorObject>} Promise that resolves to the /profiles object
 */
export async function getProfiles(dataProviderUrl) {
  const request = new FetchRequest();
  return (
    await request.getObjectByUrl(`${dataProviderUrl}/profiles`)
  ).optional();
}

/**
 * Determine whether a search term is found in the given schema title.
 * @param {string} searchTerm Term the user entered to search for
 * @param {object} searchBasis Holds title string or schema object to search, depending on mode
 * @returns {boolean} True if the search term is found in the title
 */
export function checkSearchTermTitle(searchTerm, title) {
  if (searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    return title.toLowerCase().includes(searchTermLower);
  }
  return false;
}

/**
 * Search the schema properties for the given search term. You can also pass a specific property
 * name to check whether just that property contains the search term or not.
 * @param {string} searchTerm Term the user entered to search for
 * @param {object} schemaProperties `properties` object from a schema
 * @param {string} propName Optional name of the property to check
 * @returns {boolean} True if the search term is found in the schema properties
 */
export function checkSearchTermSchema(
  searchTerm,
  schemaProperties,
  propName = ""
) {
  if (searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    const propertyNames = propName ? [propName] : Object.keys(schemaProperties);

    return propertyNames.some((propertyName) => {
      const property = schemaProperties[propertyName];
      if (!property) {
        return false;
      }

      // Check if the property name contains the search term.
      if (propertyName.toLowerCase().includes(searchTermLower)) {
        return true;
      }

      // Search the `title` property within each property within `schemaProperties`.
      if (property.title?.toLowerCase().includes(searchTermLower)) {
        return true;
      }

      // If the property has am `enum` array, search the `enum` values for the search term. We can't
      // use `includes()` for the enum array because we need to match partial strings.
      const isSearchTermInEnum = property.enum?.some((enumValue) =>
        enumValue.toLowerCase().includes(searchTermLower)
      );
      if (isSearchTermInEnum) {
        return true;
      }

      // If the property has an `items` property, search its `title` property.
      if (property.items?.title?.toLowerCase().includes(searchTermLower)) {
        return true;
      }

      // If the property has an `items` property, search its `enum` values.
      const isSearchTermInItemEnum = property.items?.enum?.some((enumValue) =>
        enumValue.toLowerCase().includes(searchTermLower)
      );
      if (isSearchTermInItemEnum) {
        return true;
      }

      // If the property has an `item` property, search its `anyOf` arrays for the enum arrays
      // within them.
      const isSearchTermInItemAnyOfEnum = property.items?.anyOf?.some((anyOf) =>
        anyOf.enum?.some((enumValue) =>
          enumValue.toLowerCase().includes(searchTermLower)
        )
      );
      if (isSearchTermInItemAnyOfEnum) {
        return true;
      }

      // If the property has an `items` object containing a `properties` object, recursively search it.
      const isSearchTermInItemProperties = property.items?.properties
        ? checkSearchTermSchema(searchTerm, property.items.properties)
        : false;
      if (isSearchTermInItemProperties) {
        return true;
      }
    });
  }
  return false;
}
