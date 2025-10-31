import type {
  DatabaseObject,
  Profiles,
  Schema,
  SearchResults,
} from "../globals.d";
import { extractSchema } from "./profiles";

/**
 * Given a database item object, return the schema that matches its @type. The first @type that
 * matches a schema in the profiles object gets used. If no match is found or `profiles` hasn't yet
 * loaded, return null.
 *
 * @param item - A database item object
 * @param profiles - Contains all schemas keyed by `@type`; from /profiles endpoint
 * @returns The first schema that matches the item's `@type`
 */
export function itemToSchema(
  item: DatabaseObject,
  profiles: Profiles
): Schema | null {
  if (profiles && item && item["@type"]) {
    return (
      item["@type"]
        .map((type) => extractSchema(profiles, type))
        .find((schema) => schema !== null) || null
    );
  }
  return null;
}

/**
 * Given a collection object, return the schema that matches its `@type`.
 * @param {object} collection Collection object including `@type` and `@graph`
 * @param {object} profiles Contains all schemas keyed by `@type`; from /profiles endpoint
 * @returns {object} The schema that matches the collection's `@type`; null if none
 */
export function collectionToSchema(
  collection: SearchResults,
  profiles: Profiles
): Schema | null {
  if (profiles && collection && collection["@type"]) {
    const collectionType = collection["@type"][0];
    if (collectionType) {
      // Extract the collection item `@type` from the collection `@type`.
      const collectionTypeMatch = collectionType.match(
        /^([a-zA-Z0-9]+)Collection$/
      );
      return collectionTypeMatch
        ? extractSchema(profiles, collectionTypeMatch[1])
        : null;
    }
  }
  return null;
}
