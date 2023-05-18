/**
 * Convert an object path into the object type.
 * @param {string} path The @id of the object to get the type for.
 * @returns Type of the object this path comes from; or the empty string if no type could be found.
 */
export function pathToType(path) {
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
export function isValidUrl(url) {
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  return true;
}

/*
 * Strips off the url paramters from the url path
 */
export function urlWithoutParams(url) {
  return url.split("?")[0];
}

/**
 * Takes an Object to be represented as JSON and sorts
 * the top level keys and arrays.
 * Arrays get ordered, and the objects in arrays also have
 * their keys sorted.
 * @param {object} obj The JSON object to sort
 * @returns The sorted JSON object
 */
export function sortedJson(obj) {
  if (Array.isArray(obj)) {
    return obj.map((value) => sortedJson(value)).sort();
  }
  // We know it's not an array if we're here because the above `if`
  if (typeof obj === "object") {
    const sorted = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key];
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
export function toShishkebabCase(text) {
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
export function removeTrailingSlash(url) {
  return url.endsWith("/") ? url.slice(0, url.length - 1) : url;
}
