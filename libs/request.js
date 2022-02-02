import { SERVER_URL } from "./constants"

/**
 * Request the object with the given path from the server without any embedded properties.
 * @param {string} path Path to requested resource
 * @returns {object} Requested object
 */
export const getObject = async (path) => {
  const response = await fetch(`${SERVER_URL}${path}?frame=object`)
  return response.json()
}

/**
 * Request a number of objects with the given paths from the server without any embedded properties.
 * @param {array} paths Array of paths to requested resources
 * @returns {array} Array of requested objects
 */
export const getMultipleObjects = async (paths) =>
  paths.length > 0 ? Promise.all(paths.map((path) => getObject(path))) : []

/**
 * Request the collection (e.g. "users") with the given path from the server.
 * @param {string} collection Name of the collection to request
 * @returns {object} Collection data including all its members in @graph
 */
export const getCollection = async (collection) => {
  const response = await fetch(`${SERVER_URL}/${collection}/`)
  return response.json()
}
