// libs
import FetchRequest from "./fetch-request";
// types
import {
  DataProviderObject,
  SchemaProperties,
  SchemaProperty,
} from "../globals.d";

/**
 * The search mode for the search term. This specifies either the title of the schema or the
 * content of the schema.
 */
export const SEARCH_MODE_TITLE = "SEARCH_MODE_TITLE";
export const SEARCH_MODE_PROPERTIES = "SEARCH_MODE_PROPERTIES";

/**
 * Loads the schemas for all object types, with each key of the object being the @type for each
 * schema.
 * @param dataProviderUrl URL of the data provider instance
 * @returns Promise that resolves to the /profiles object
 */
export async function getProfiles(
  dataProviderUrl: string
): Promise<DataProviderObject | null> {
  const request = new FetchRequest();
  return (
    await request.getObjectByUrl(`${dataProviderUrl}/profiles`)
  ).optional();
}

/**
 * Determine whether a search term is found in the given schema title, without considering case.
 * @param searchTerm Term the user entered to search for
 * @param title Holds schema's title
 * @returns True if the search term is found in the title
 */
export function checkSearchTermTitle(
  searchTerm: string,
  title: string
): boolean {
  if (searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    return title.toLowerCase().includes(searchTermLower);
  }
  return false;
}

/**
 * Represents an object within the schema contained within `anyOf` or `oneOf` arrays.
 */
type AnyOrOneOf = {
  enum?: string[];
  anyOf?: object[];
  oneOf?: object[];
};

/**
 * Check if the search term is found in the `enum` values of the `anyOf` or `oneOf` arrays within
 * the schema. `anyOf` and `oneOf` arrays themselves can also contain `anyOf` and `oneOf` arrays
 * within them, so this function descends those branches recursively until we find the search term,
 * or we can't find the search term anywhere in the tree.
 * @param searchTermLower Term the user entered to search for, already lowercased
 * @param anyOfOrOneOf Array value of an `anyOf` or `oneOf` property in a schema
 * @returns True if the search term exists somewhere in the `enum` values of the `anyOf` or `oneOf`
 */
function checkAnyOfOrOneOf(
  searchTermLower: string,
  anyOfOrOneOf: AnyOrOneOf[]
): boolean {
  return anyOfOrOneOf.some((element) => {
    // Each element can only contain one of `enum`, `anyOf`, or `oneOf` properties.
    if (element.enum) {
      return element.enum.some((enumValue) =>
        enumValue.toLowerCase().includes(searchTermLower)
      );
    }

    // No enum; check if embedded `anyOf` or `oneOf` arrays contain enums with the search term.
    const anyOfOrOneOf = (element.anyOf || element.oneOf) as AnyOrOneOf[];
    if (anyOfOrOneOf) {
      return checkAnyOfOrOneOf(searchTermLower, anyOfOrOneOf);
    }
  });
}

/**
 * Search the schema properties for the given search term. You can also pass a specific property
 * name to check whether just that property contains the search term or not.
 * @param searchTerm Term the user entered to search for
 * @param schemaProperties `properties` object from a schema
 * @param propName Optional name of the property to check
 * @returns True if the search term is found in the schema properties
 */
export function checkSearchTermSchema(
  searchTerm: string,
  schemaProperties: SchemaProperties,
  propName = ""
): boolean {
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

      // If the property has an `item` property, search its `anyOf` or `oneOf` arrays for the enum
      // arrays within them.
      let isSearchTermInAnyOfAndOneOf = false;
      const anyOfOrOneOf =
        property.anyOf ||
        property.oneOf ||
        property.items?.anyOf ||
        property.items?.oneOf;
      if (anyOfOrOneOf) {
        isSearchTermInAnyOfAndOneOf = checkAnyOfOrOneOf(
          searchTermLower,
          anyOfOrOneOf
        );
      }
      if (isSearchTermInAnyOfAndOneOf) {
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

/**
 * Determine whether a schema property is not submittable.
 * @param {object} property Property to test to see if it's not submittable
 * @returns {boolean} True if the property is not submittable
 */
export function notSubmittableProperty(property: SchemaProperty): boolean {
  return (
    property.notSubmittable ||
    property.readonly ||
    property.permission === "import_items"
  );
}

/**
 * Generate the complete URL of a tab within a schema page. It needs the URL of the individual
 * schema page the user is viewing, and it adds the elements to select a tab to open on page load.
 * @param schemaPageUrl Complete URL of the schema page for a collection type
 * @param tabId HTML ID of the tab that needs the URL generated by this function
 * @param parentTabId HTML ID of the parent to this tab, if any
 * @returns Complete URL of the tab; empty string if the schema page URL is empty
 */
export function schemaPageTabUrl(
  schemaPageUrl: string | null,
  tabId: string
): string {
  return schemaPageUrl ? `${schemaPageUrl}${tabId}/` : "";
}
