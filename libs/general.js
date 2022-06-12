// Take an @id and return the corresponding object type. If no object type could be found in the
// @id, the empty string is returned.
/**
 * Convert an object path into the object type.
 * @param {string} path - The @id of the object to get the type for.
 * @returns Type of the object this path comes from; or the empty string if no type could be found.
 */
export const pathToType = (path) => {
  const matched = path.match(/^\/(.+)\/.+\/$/)
  if (matched && matched.length === 2) {
    return matched[1]
  }
  return ""
}

/**
 * If you need to delay a certain amount of time inline with other code, you can use this function
 * to create a timer promise. Once the timer expires, the promise resolves. If you need a delay
 * between iterations of a loop, this function can let you have a clean solution.
 * @param {number} ms Number of milliseconds to delay
 * @returns {Promise} Promise that resolves after the specified number of milliseconds
 */
export const delayPromise = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
