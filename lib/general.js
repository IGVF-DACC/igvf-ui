/**
 * Convert an object path into the object type.
 * @param {string} path The @id of the object to get the type for.
 * @returns Type of the object this path comes from; or the empty string if no type could be found.
 */
export const pathToType = (path) => {
  const matched = path.match(/^\/(.+)\/.+\/$/);
  if (matched && matched.length === 2) {
    return matched[1];
  }
  return "";
};

/**
 * Checks whether the given string is a valid URL. Paths with no protocol aren't considered valid
 * URLs.
 * @param {string} url The URL to check
 * @returns {boolean} True if the given string is a valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  return true;
};
