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
