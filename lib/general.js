/**
 * Convert an object path into the object type.
 * @param {string} path - The @id of the object to get the type for.
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
 * Strips off the url paramters from the url path
 */
 export const urlWithoutParams = (url) => {
  return url.split("?")[0];
};
