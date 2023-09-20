/**
 * Convert an object path into the object type.
 * @param {string} path The @id of the object to get the type for.
 * @returns {string} Type of the object this path comes from; or the empty string if no type could be found.
 */
export function pathToType(path: string): string {
  const matched = path.match(/^\/(.+)\/.+\/$/);
  if (matched && matched.length === 2) {
    return matched[1];
  }
  return "";
}

/**
 * Checks whether the given string is a valid URL. Paths with no protocol aren't considered valid
 * URLs.
 * @param {string} url The URL to check
 * @returns {boolean} True if the given string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Strips off the url parameters from the url path
 * @param {string} url The url to strip query parameters from
 * @returns {string} The URL string without the query parameters
 */
export function urlWithoutParams(url: string): string {
  return url.split("?")[0];
}

export type JSON =
  | null
  | boolean
  | string
  | number
  | Array<JSON>
  | { [key: string]: JSON };

/**
 * Takes an Object to be represented as JSON and sorts
 * the top level keys and arrays.
 * Arrays get ordered, and the objects in arrays also have
 * their keys sorted.
 * @param {object} obj The JSON object to sort
 * @returns The sorted JSON object
 */
export function sortedJson(obj: JSON): JSON {
  if (Array.isArray(obj)) {
    return obj.map((value) => sortedJson(value)).sort();
  }
  // We know it's not an array at this point
  if (typeof obj === "object") {
    const sorted: { [key: string]: JSON } = {};
    const o = obj as { [key: string]: JSON };
    Object.keys(o)
      .sort()
      .forEach((key) => {
        sorted[key] = o[key];
      });
    return sorted;
  }
  return obj;
}

/**
 * Convert arbitrary text to a shishkebab case string. Anything not a letter or number gets replaced
 * with a dash. Multiple dashes get replaced with a single dash. Leading and trailing dashes get
 * removed.
 * @param {string} text Text to convert.
 * @returns {string} `text` converted to shishkebab case.
 */
export function toShishkebabCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Convert url to a url without trailing slash
 * @param {string} url Url to remove trailing slash
 * @returns {string} Url without trailing slash
 */
export function removeTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, url.length - 1) : url;
}

/**
 * Tests numeric values that we should display even if zero, but shouldn't get displayed if
 * undefined.
 * @param {number | null | undefined} value Check for truthy or zero
 * @returns {boolean} True if the value is truthy or zero
 */
export function truthyOrZero(value: number | null | undefined): boolean {
  return Boolean(value) || value === 0;
}

/**
 * Maximum number of characters to display for a JSON object in a cell.
 */
const MAX_CELL_JSON_LENGTH = 200;

/**
 * Convert an object to stringified JSON and truncate it to the desired length.
 * @param {object} obj Object or array to stringify and truncate
 * @param {number} [maxOutputLength] Maximum number of characters to display
 * @returns {string} Truncated JSON
 */
export function truncateJson(
  obj: JSON,
  maxOutputLength: number = MAX_CELL_JSON_LENGTH
): string {
  const json = JSON.stringify(obj);
  return json.length > maxOutputLength
    ? `${json.substring(0, maxOutputLength)}...`
    : json;
}
