/**
 * Use this type to represent a property that can either be a link to another object (represented
 * as a string) or an embedded object itself (represented as a generic type T). This is useful for
 * handling cases where an API might return either a reference to another resource or the full
 * resource data.
 */
export type LinkTo<T> = string | T;

/**
 * Type guard to check if a LinkTo<T> value is a string (i.e., a link) or an embedded object (T).
 *
 * @param value - Object property to check if it is a link (string)
 * @returns True if the property is a link (string), false if it is an embedded object (T).
 */
export function isPath<T>(value: LinkTo<T>): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if a LinkTo<T> value is an array of links (strings) rather than an array of
 * embedded objects (T). This is useful for properties that can be arrays of either links or
 * embedded objects.
 *
 * @param value - Object property to check if it's an array of links (string)
 * @returns True if the property is an array of links (strings)
 */
export function isPathArray<T>(
  value: LinkTo<T>[] | undefined | null
): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

/**
 * Type guard to check if a LinkTo<T> value is an embedded object (T) rather than a string (i.e., a
 * link).
 *
 * @param value - Object property to check if it is an embedded object (T)
 * @returns True if the property is an embedded object (T), false if it is a link (string).
 */
export function isEmbedded<T extends object>(value: LinkTo<T>): value is T {
  return typeof value === "object" && value !== null;
}

/**
 * Type guard to check if a LinkTo<T> value is an array of embedded objects (T) rather than an array of
 * links (strings). This is useful for properties that can be arrays of either links or embedded objects.
 *
 * @param value - Object property to check if it's an array of embedded objects (T)
 * @returns True if the property is an array of embedded objects (T)
 */
export function isEmbeddedArray<T extends object>(
  value: LinkTo<T>[] | undefined | null
): value is T[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "object" && item !== null)
  );
}
