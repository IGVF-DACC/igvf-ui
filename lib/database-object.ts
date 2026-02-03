// root
import {
  AnalysisStepObject,
  AnalysisStepVersionObject,
  AwardObject,
  DatabaseObject,
  DocumentObject,
  FileObject,
  FileSetObject,
  GeneObject,
  HumanDonorObject,
  LabObject,
  OntologyTermObject,
  PageObject,
  PublicationObject,
  SampleObject,
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
 * Type guard to check whether an object looks like a valid database object of any type or not.
 *
 * @param item - Object to check if it looks like a valid database object of any type
 * @returns True if the object looks like a valid database object
 */
export function isDatabaseObject(item: unknown): item is DatabaseObject {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  const itemObject = item as Record<string, unknown>;
  if (typeof itemObject["@id"] !== "string") {
    return false;
  }

  const types = itemObject["@type"];
  if (!Array.isArray(types)) {
    return false;
  }
  if (!types.every((typeName) => typeof typeName === "string")) {
    return false;
  }

  return true;
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
  return isDatabaseObject(item) && item["@type"].includes(typeName);
}

/**
 * Type guard to check whether an array contains only database objects of a specific `@type`.
 *
 * @param items - Array of items to check if they all match objects of a specific `@type`
 * @param typeName - `@type` of the type to test the objects against
 * @returns True if all items in the array are database objects of the specified `@type`
 */
export function isDatabaseObjectArrayOfType<K extends keyof DatabaseTypeMap>(
  items: unknown,
  typeName: K
): items is DatabaseTypeMap[K][] {
  if (!Array.isArray(items)) {
    return false;
  }

  return items.every((item) => {
    return isDatabaseObjectOfType(item, typeName);
  });
}
