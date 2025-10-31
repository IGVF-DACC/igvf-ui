// libs
import FetchRequest from "./fetch-request";
// types
import {
  CollectionTitles,
  DataProviderObject,
  ProfileHierarchy,
  Profiles,
  ProfilesProps,
  Schema,
  SchemaProperties,
  SchemaProperty,
} from "../globals.d";

/**
 * The search mode for the search term. This specifies either the title of the schema or the
 * content of the schema.
 */
export type SearchMode = "SEARCH_MODE_TITLE" | "SEARCH_MODE_PROPERTIES";

/**
 * Loads the schemas for all object types, with each key of the object being the @type for each
 * schema.
 *
 * @param dataProviderUrl URL of the data provider instance
 * @returns Promise that resolves to the /profiles object
 */
export async function getProfiles(): Promise<DataProviderObject | null> {
  const request = new FetchRequest({ backend: true });
  return (await request.getObject("/api/profiles/")).optional();
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

/**
 * Get the @type corresponding to the given schema.
 * @param schema Individual schema to get the type of
 * @param profiles Output of the /profiles endpoint
 * @returns The @type of the schema; empty string if schema not found in profiles, or no profiles
 */
export function schemaToType(schema: Schema, profiles: Profiles): string {
  let objectType: string | undefined;
  if (profiles) {
    const objectTypes = Object.keys(profiles);
    objectType = objectTypes.find(
      (type) => extractSchema(profiles, type)?.$id === schema.$id
    );
  }
  return objectType || "";
}

/**
 * Type guard to determine whether an unknown value is a Schema.
 *
 * @param value - Value to test as a Schema
 * @returns True if the value is a Schema; false otherwise
 */
export function isSchema(value: unknown): value is Schema {
  let hasPassedTests = false;
  if (value && typeof value === "object") {
    const potentialSchema = value as Schema;
    const hasProperties =
      typeof potentialSchema.properties === "object" &&
      potentialSchema.properties !== null;

    // Allow $schema and @type to be absent in lightweight test mocks, but if present ensure types
    // are correct.
    const idOk =
      !("$id" in potentialSchema) || typeof potentialSchema.$id === "string";
    const schemaOk =
      !("$schema" in potentialSchema) ||
      typeof potentialSchema.$schema === "string";
    const atTypeOk =
      !("@type" in potentialSchema) || Array.isArray(potentialSchema["@type"]);
    hasPassedTests = hasProperties && idOk && schemaOk && atTypeOk;
  }
  return hasPassedTests;
}

/**
 * Safely extract a schema from profiles by `@type`.
 *
 * @param profiles - Profiles object containing all schemas
 * @param type - `@type` of the schema to retrieve
 * @returns The schema matching the given `@type`; null if not found
 */
export function extractSchema(
  profiles: Profiles | undefined | null,
  type: string
): Schema | null {
  let extractedSchema: Schema | null = null;
  if (profiles) {
    const candidate = profiles[type];
    extractedSchema = isSchema(candidate) ? candidate : null;
  }
  return extractedSchema;
}

/**
 * Given a schema, return the path to the corresponding individual schema page.
 * @param schema Individual schema to get the path for
 * @returns Path to the individual schema page
 */
export function schemaToPath(schema: Schema): string {
  return schema.$id.replace(".json", "");
}

/**
 * Recursive function to find the root-level parent `@type` of a given `@type`.
 *
 * @param atType - `@type` to find the root parent for
 * @param hierarchy - schema hierarchy node to search within
 * @param rootParent - current root-level parent being considered; initially empty
 * @returns Root-level parent `@type` if found; empty string otherwise
 */
function typeToRootTypeSearch(
  atType: string,
  hierarchy: ProfileHierarchy,
  rootParent = ""
): string {
  // Loop through each key at the current level of the hierarchy, searching for a matching `@type`
  // or descending deeper into each key's children for those that have any.
  for (const [parent, nestedChildren] of Object.entries(hierarchy)) {
    // The initial call doesn't provide `rootParent`, so we use the current parent as the root
    // parent. As we descend the hierarchy, the root parent gets maintained.
    const currentRoot = rootParent || parent;

    // We're done if `atType` is a root parent.
    if (parent === atType && !rootParent) {
      return parent;
    }

    // Stop searching if we found the type under the current parent.
    if (Object.keys(nestedChildren).includes(atType)) {
      return currentRoot;
    }

    // Didn't find the `@type` we seek. Recursively search in nested children, passing down the
    // root parent. If the `@type` is found deeper in the current node's children, the root parent
    // gets returned, and the search completes.
    const rootParentFromChild = typeToRootTypeSearch(
      atType,
      nestedChildren,
      currentRoot
    );
    if (rootParentFromChild) {
      return rootParentFromChild;
    }
  }

  // Didn't find the `@type` anywhere in the hierarchy.
  return "";
}

/**
 * Resolves the root-level parent `@type` for a given `@type`.
 *
 * If the input `@type` is a concrete subtype of an abstract parent, the function returns
 * that abstract parent. If the input `@type` is already a root type, it is returned as is.
 *
 * Example hierarchy:
 * - Gene
 * - Sample
 *   - Biosample
 *     - InVitroSystem
 *
 * Examples:
 * - `InVitroSystem` -> `Sample`
 * - `Biosample` -> `Sample`
 * - `Sample` -> `Sample`
 * - `Gene` -> `Gene`
 *
 * @param type - The `@type` to resolve
 * @param profiles - Schema profiles defining type hierarchies
 * @returns The root-level parent `@type` of the given type; empty string if not found
 */
export function typeToRootType(type: string, profiles: ProfilesProps): string {
  const hierarchy = profiles?._hierarchy?.Item as ProfileHierarchy;
  return hierarchy ? typeToRootTypeSearch(type, hierarchy) : "";
}

/**
 * Given a schema name, return the corresponding collection name. Examples of schema names and
 * their corresponding collection names:
 *
 * - "tissue" -> "tissues"
 * - "in_vitro_system" -> "in-vitro-systems"
 * - "single_cell_atac_seq_quality_metric" -> "single-cell-atac-seq-quality-metrics"
 *
 * @param schemaName Name of the schema
 * @param collectionTitles Mapping of schema names to collection titles
 * @returns Corresponding collection name for the given schema name; empty string if not found
 */
export function schemaNameToCollectionName(
  schemaName: string,
  collectionTitles: CollectionTitles
): string {
  if (collectionTitles && schemaName in collectionTitles) {
    const collectionTitle = collectionTitles[schemaName];

    // Get all properties in collectionTitles that share the same value as collectionTitle.
    const idsWithMatchingTitles = Object.keys(collectionTitles).filter(
      (key) => collectionTitles[key] === collectionTitle
    );

    // Now find the one string in `idsWithMatchingTitles` that doesn't start with an uppercase
    // letter and that doesn't match `schemaName`. That's the collection name.
    return (
      idsWithMatchingTitles.find(
        (name) => name !== schemaName && !/^[A-Z]/.test(name)
      ) || ""
    );
  }
  return "";
}
