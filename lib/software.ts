// lib
import { requestSoftware } from "./common-requests";
import { isDatabaseObject } from "./database-object";
import FetchRequest from "./fetch-request";
// root
import type { DatabaseObject, SoftwareObject } from "../globals";

/**
 * Requests software objects for the given database objects from their `software` properties.
 * `software` can contain path or a partial Software object.
 *
 * @param items - Database objects that may contain `software` properties
 * @param request - FetchRequest object used to make the request for software
 * @param additionalProperties - Additional properties to request for each software object
 * @returns Software objects from the given database objects, deduplicated by their paths
 */
export async function requestSoftwareFromObjects(
  items: DatabaseObject[],
  request: FetchRequest,
  additionalProperties: string[] = []
): Promise<SoftwareObject[]> {
  // Extract unique software paths from the provided database objects. `software` can be a path or a
  // partial Software object.
  const softwarePaths = [
    ...new Set(
      items
        .map((item) => {
          if (!("software" in item)) {
            return null;
          }

          if (typeof item.software === "string") {
            // `software` is a string path, so we can return it directly.
            return item.software;
          }

          // `software` is an object, so we need to check if it's a valid database object and
          // extract its path.
          return isDatabaseObject(item.software) ? item.software["@id"] : null;
        })
        .filter((path): path is string => Boolean(path))
    ),
  ];

  // Request the software objects for the extracted paths.
  return softwarePaths.length > 0
    ? requestSoftware(softwarePaths, request, additionalProperties)
    : [];
}
