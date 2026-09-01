// lib
import { requestSoftwareVersions } from "./common-requests";
import { pathsFromDatabaseObjects } from "./database-object";
import FetchRequest from "./fetch-request";
// root
import type { DatabaseObject, SoftwareVersionObject } from "../globals";

/**
 * Type guard to check whether an object is a minimal software version object with only `@id` and
 * `name` properties, as you'd find in the `software_versions` property of an analysis step version
 * object.
 *
 * @param item - Possible software version object with minimal properties
 * @returns True if the object is a minimal software version object
 */
export function isMinimalSoftwareVersionObject(
  item: unknown
): item is { "@id": string; name: string } {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const possibleSoftwareVersion = item as Record<string, unknown>;
    if (
      "@id" in possibleSoftwareVersion &&
      typeof possibleSoftwareVersion["@id"] === "string" &&
      "name" in possibleSoftwareVersion &&
      typeof possibleSoftwareVersion.name === "string"
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Type guard to check whether an array contains only minimal software version objects with only
 * `@id` and `name` properties, as you'd find in the `software_versions` property of an analysis
 * step version object.
 *
 * @param items - Possible array of minimal software version objects
 * @returns True if `items` looks like an array of minimal software version objects
 */
export function isMinimalSoftwareVersionObjectArray(
  items: unknown
): items is { "@id": string; name: string }[] {
  if (!Array.isArray(items)) {
    return false;
  }

  return items.every((item) => isMinimalSoftwareVersionObject(item));
}

/**
 * Requests software-version objects for the given database objects from their `software_versions`
 * properties. `software_versions` can contain an array of paths or an array of partial
 * SoftwareVersion objects.
 *
 * @param items - Database objects that may contain `software_versions` properties
 * @param request - FetchRequest object used to make the request for software versions
 * @param additionalProperties - Additional properties to request for each software version
 * @returns Software version objects from the given database objects, deduplicated by their paths
 */
export async function requestSoftwareVersionsFromObjects(
  items: DatabaseObject[],
  request: FetchRequest,
  additionalProperties: string[] = []
): Promise<SoftwareVersionObject[]> {
  // Extract unique software version paths from the provided database objects.
  const softwareVersionPaths = [
    ...new Set(
      items.flatMap((item) =>
        "software_versions" in item
          ? pathsFromDatabaseObjects(item.software_versions)
          : []
      )
    ),
  ];

  // Request the software versions for the extracted paths.
  return softwareVersionPaths.length > 0
    ? requestSoftwareVersions(
        softwareVersionPaths,
        request,
        additionalProperties
      )
    : [];
}
