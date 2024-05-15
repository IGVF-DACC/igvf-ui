// lib
import { UC } from "./constants";

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
 * Check whether the input string is a path or not.
 * @param input String to check if it is a path
 * @returns True if the input is a path
 */
export function isValidPath(input: string): boolean {
  return input.startsWith("/");
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

/**
 * Get the item `@id` from either just the ID string itself or
 * from an object with `@id` as a key.
 * @param {string} item The item, either string or object with `@id`
 * @returns The `@id` value if item is an object or just the passed
 * in string if a string
 */
export function itemId(item: string | { "@id": string }): string {
  return typeof item === "string" ? item : item["@id"];
}

export type JSON =
  | null
  | boolean
  | string
  | number
  | Array<JSON>
  | { [key: string]: JSON };

/**
 * An interface describing an Error object. If an
 * object has the property `isError: true` then it
 * can be detectable as an error type for consumers
 * concerned with discerning errors from non-errors.
 */
export interface IsError {
  isError: true;
}

/**
 * Takes a value which could be an error, and if so, returns
 * a default of null. If not an error, the value is merely returned.
 * This is used to sort of flatten the Error possibility into just
 * T or null.
 * @param {T | E extends IsError | null} x The value to be defaulted
 * @returns null if x is null or extends IsError, returns the parameter
 * x otherwise
 */
export function nullOnError<T, E extends IsError>(x: T | E | null): T | null {
  if (x && typeof x === "object" && "isError" in x) {
    return null;
  }
  return x;
}

/**
 * Copy the given object but with its properties sorted alphabetically. Properties that are
 * themselves objects get sorted recursively. Properties that are arrays of objects have their
 * objects sorted. This does not handle arrays of arrays of objects, so hopefully we don't have to
 * deal with that.
 * @param obj Sort the properties of this object
 * @returns Copy of `obj` with its properties sorted
 */
export function sortObjectProps(obj: object): object {
  return Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      const prop = (obj as Record<string, unknown>)[key];

      if (typeof prop === "object") {
        // Properties that are objects should themselves get sorted recursively.
        if (!Array.isArray(prop)) {
          return {
            ...sorted,
            [key]: sortObjectProps(prop!),
          };
        }

        // Properties that are arrays of objects should have their objects sorted.
        if (
          prop.length > 0 &&
          typeof prop[0] === "object" &&
          !Array.isArray(prop[0])
        ) {
          return {
            ...sorted,
            [key]: prop.map((item) => sortObjectProps(item)),
          };
        }
      }

      // Simple properties, arrays of simple properties, and empty arrays simply get added to the
      // sorted object.
      return {
        ...sorted,
        [key]: prop,
      };
    }, {});
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

/**
 * Convert arbitrary text to a human readable string.
 * All underscores gets replaced with a space
 * and the first letter of each word gets capitalized.
 * @param {string} text Text to convert.
 * @returns {string} `text` converted to human-readable case.
 */
export function snakeCaseToHuman(text: string): string {
  return text
    .toLowerCase()
    .replace(/^_|_$/g, "")
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Convert a snake-case string to Pascal case.
 * @param snakeCaseText Snake-case string to convert to Pascal case
 * @returns String converted to Pascal case
 */
export function snakeCaseToPascalCase2(snakeCaseText: string): string {
  return snakeCaseText
    .split("_")
    .map((element) => `${element.charAt(0).toUpperCase()}${element.slice(1)}`)
    .join("");
}

/**
 * Convert a snake-case string to Pascal case.
 * @param snakeCaseText Snake-case string to convert to Pascal case
 * @returns String converted to Pascal case
 */
export function snakeCaseToPascalCase(snakeCaseText: string): string {
  const snakeCaseElements = snakeCaseText.split("_");
  const pascalCaseElements = snakeCaseElements.map(
    (element) => `${element.charAt(0).toUpperCase()}${element.slice(1)}`
  );
  return pascalCaseElements.join("");
}

/**
 * Display the size of data in a human-readable format, including magnitude units such as B, KB,
 * MB, GB, TB, and PB. If the result has only one digit before the decimal point, show one digit
 * after the decimal point. Otherwise, show no digits after the decimal point. Values above PB
 * produce undefined results.
 * @param {number} size The size of the data in bytes
 * @returns {string} The size of the data in a human-readable format
 */
export function dataSize(size: number): string {
  if (size > 0) {
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    const magnitude = Math.floor(Math.log10(size) / 3);
    const value = size / Math.pow(10, magnitude * 3);
    const digits = value < 10 ? 1 : 0;
    return `${value.toFixed(digits)} ${units[magnitude]}`;
  }

  // Can't do calculation for zero or negative sizes.
  return "0 B";
}

/**
 * Abbreviate a number to a string with an order-of-magnitude suffix (e.g. 1000 => 1K). Works well
 * for numbers less than 1 trillion.
 * @param {number} number The number to abbreviate
 * @returns {string} The abbreviated number
 */
export function abbreviateNumber(number: number): string {
  // Round to the nearest tenth if two digits or less, otherwise round to the nearest whole.
  function toTenthOrWhole(hundredsOf: number): string {
    return hundredsOf.toFixed(hundredsOf < 100 ? 1 : 0);
  }

  if (number >= 1_000_000_000) {
    const hundredsOf = number / 1_000_000_000;
    return `${toTenthOrWhole(hundredsOf)}B`;
  }
  if (number >= 1_000_000) {
    const hundredsOf = number / 1_000_000;
    return `${toTenthOrWhole(hundredsOf)}M`;
  }
  if (number >= 1000) {
    const hundredsOf = number / 1000;
    return `${toTenthOrWhole(hundredsOf)}K`;
  }
  return number.toString();
}

/**
 * Truncates a string to the given maximum length, adding an ellipsis if the string is longer than
 * the maximum length. Try not to truncate a string in the middle of a word, backing up to the
 * previous space if possible. This isn't possible if the string consists a single word that's
 * longer than the maximum length. In that case, just truncate the text to the maximum length.
 * @param text Text to truncate
 * @param maxLength Maximum length of the text
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number) {
  let processedText = text;
  if (processedText.length > maxLength) {
    const trimmedText = processedText.replace(/(^\s)|(\s$)/gi, ""); // Trim leading/trailing white space
    const truncatedText = trimmedText.substring(0, maxLength); // Truncate to maxLength
    const isOneWord = truncatedText.match(/\s/gi) === null; // Detect single-word string

    // Truncate to the previous word boundary in the truncated string unless the entire string has
    // no spaces, in which case we just truncate in the middle of that word.
    const finalTruncatedText = isOneWord
      ? truncatedText
      : truncatedText.substring(0, truncatedText.lastIndexOf(" "));
    processedText = `${finalTruncatedText}${UC.hellip}`;
  }
  return processedText;
}
