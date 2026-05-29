// lib
import { isErrorObject } from "./fetch-request";
import { type FileSetObject } from "./file-sets";
import { type SampleObject } from "./samples";
import { isPathArray } from "./types";
// root
import type {
  AnalysisStepObject,
  AnalysisStepVersionObject,
  AwardObject,
  DatabaseObject,
  DocumentObject,
  DonorObject,
  FileObject,
  GeneObject,
  HumanDonorObject,
  LabObject,
  OntologyTermObject,
  PageObject,
  PublicationObject,
  SoftwareObject,
  SoftwareVersionObject,
  UserObject,
} from "../globals";

/**
 * Mapping of database object `@type` strings to their corresponding TypeScript types. Add new
 * database object types here as needed.
 */
type DatabaseTypeMap = {
  AnalysisStep: AnalysisStepObject;
  AnalysisStepVersion: AnalysisStepVersionObject;
  Award: AwardObject;
  Document: DocumentObject;
  Donor: DonorObject;
  File: FileObject;
  FileSet: FileSetObject;
  Gene: GeneObject;
  HumanDonor: HumanDonorObject;
  Lab: LabObject;
  OntologyTerm: OntologyTermObject;
  Page: PageObject;
  Publication: PublicationObject;
  Sample: SampleObject;
  Software: SoftwareObject;
  SoftwareVersion: SoftwareVersionObject;
  User: UserObject;
};

/**
 * For functions with a `checkType` parameter, this type defines its options. The `checkType`
 * parameter determines whether the function should check for the presence of a valid `@type`
 * property to help determine whether an object looks like a valid database object or not. Database
 * objects might not have an `@type` property if they're not fully represented, which they often
 * aren't when embedded in other objects.
 *
 * `checkType` - Check that the object has a valid `@type` property with an array of strings as its
 *               value.
 * `noCheckType` - Don't check for the presence of a valid `@type` property.
 */
type CheckTypeOptions = "checkType" | "noCheckType";

/**
 * Type guard to check whether an object looks like a valid database object of any type or not. You
 * can subsequently narrow the type of the object using other type guards like
 * `isDatabaseObjectOfType` or `isDatabaseObjectArrayOfType` to check for specific `@type`s.
 *
 * Set `checkType` to "checkType" to check for the presence of a valid `@type` property as well, or
 * "noCheckType" to skip this check. If you use this to check embedded object arrays, they often
 * don't have an `@type` property so leave `checkType` as "noCheckType" for that case.
 *
 * @param item - Object to check if it looks like a valid database object of any type
 * @param checkType - Whether to check for the presence of a valid `@type` property as well, or just
 *   the presence of an `@id` property.
 * @returns True if the object looks like a valid database object
 */
export function isDatabaseObject(
  item: unknown,
  checkType: CheckTypeOptions = "noCheckType"
): item is DatabaseObject {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  if (isErrorObject(item)) {
    return false;
  }

  const itemObject = item as Record<string, unknown>;
  if (typeof itemObject["@id"] !== "string") {
    return false;
  }

  if (checkType === "checkType") {
    const types = itemObject["@type"];
    if (!Array.isArray(types)) {
      return false;
    }
    if (!types.every((typeName) => typeof typeName === "string")) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard to check whether a value is an array of what appear to be database objects or not.
 * Passing an empty array returns false.
 *
 * @param items - Value to check if it's an array of database objects
 * @param checkType - Whether to check for the presence of a valid `@type` property
 * @returns True if the value is an array of database objects
 */
export function isDatabaseObjectArray(
  items: unknown,
  checkType: CheckTypeOptions = "noCheckType"
): items is DatabaseObject[] {
  if (Array.isArray(items) && items.length > 0) {
    return items.every((item) => isDatabaseObject(item, checkType));
  }
  return false;
}

/**
 * Type guard to check whether an object is a database object of a specific `@type`.
 *
 * @param item - Object to test if it's a database object of a specific `@type`
 * @param typeName - `@type` of the type to test the object against
 * @returns True if the object is a database object of the specified `@type`
 */
export function isDatabaseObjectOfType<K extends keyof DatabaseTypeMap>(
  item: unknown,
  typeName: K
): item is DatabaseTypeMap[K] {
  return (
    isDatabaseObject(item, "checkType") && item["@type"].includes(typeName)
  );
}

/**
 * Type guard to check whether an array contains only database objects of a specific `@type`.
 * Passing an empty array returns false.
 *
 * @param items - Array of items to check if they all match objects of a specific `@type`
 * @param typeName - `@type` of the type to test the objects against
 * @returns True if all items in the array are database objects of the specified `@type`
 */
export function isDatabaseObjectArrayOfType<K extends keyof DatabaseTypeMap>(
  items: unknown,
  typeName: K
): items is DatabaseTypeMap[K][] {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every((item) => {
    return isDatabaseObjectOfType(item, typeName);
  });
}

/**
 * Given an array of database objects, return an array of paths to those objects. This is often
 * used to get the paths needed for a request for an array of database objects when we already have
 * an array of those objects, but they're not complete enough to use in the UI.
 *
 * If the array actually contains paths to database objects instead of the objects themselves, just
 * return the array of paths as is. Callers don't have to check whether `items` is an array of
 * database objects or an array of paths before calling this function that can handle both cases.
 * If the array contains something other than database objects or paths, return an empty array.
 *
 * @param items - Array of objects to convert to paths to those objects
 * @returns Array of string paths to the given objects
 */
export function pathsFromDatabaseObjects(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  let paths: string[] = [];
  if (isDatabaseObjectArray(items)) {
    paths = items.map((item) => item["@id"]);
  } else if (isPathArray(items)) {
    paths = items;
  }

  return paths;
}
